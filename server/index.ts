import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './middleware';
import dotenv from 'dotenv';
import passport from './auth';
import gameRouter from './game';
import userHandler from './user';
import { Fido2Lib, Factor } from "fido2-lib";
import base64url from 'base64url';
import UserModel from './models/user';
import { ObjectId } from 'mongodb';

declare module 'express-session' {
  export interface SessionData {
    challenge: { [key: string]: any };
  }
}

dotenv.config();

const app = express();

const f2l = new Fido2Lib({
    challengeSize: 128,
    attestation: "none",
    cryptoParams: [-7, -257],
    authenticatorAttachment: "platform",
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: "required"
});

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB }),
  cookie: {
    sameSite: "lax"
  }
}));

function toBuffer(ab: ArrayBuffer) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

const port = process.env.PORT || 5000;

console.log("Try to connect to db")

const run = async () => {
  try {
    await mongoose.connect(process.env.DB || '');
  } catch (err) {
    console.log("Err:", err)
    process.exit();
  }

  const userRouter = userHandler(passport);

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api', userRouter);
  app.use('/api', isAuthenticated, gameRouter);

  app.get('/api/registration-options', isAuthenticated, async (req, res) => {
    const registrationOptions = await f2l.attestationOptions();

    req.session.challenge = Buffer.from(registrationOptions.challenge);
    // req.session.userHandle = crypto.randomBytes(32);

    registrationOptions.user.id = req.user!.id;
    registrationOptions.challenge = Buffer.from(registrationOptions.challenge);

    // iOS
    // registrationOptions.authenticatorSelection = {authenticatorAttachment: 'platform'};

    res.json(registrationOptions);
  });

  app.post('/api/register', isAuthenticated, async (req, res) => {
    const {credential} = req.body;
    const rawId: string = credential.rawId;

    const challenge = req.session.challenge?.data;
    credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
    credential.response.attestationObject = base64url.decode(credential.response.attestationObject, 'base64');
    credential.response.clientDataJSON = base64url.decode(credential.response.clientDataJSON, 'base64');

    const attestationExpectations = {
      challenge,
      origin: 'http://localhost:3000',
      factor: 'either' as Factor
    };

    try {
      const regResult = await f2l.attestationResult(credential, attestationExpectations);

      const publicKey = regResult.authnrData.get('credentialPublicKeyPem');

      await UserModel.updateOne({
        _id: new ObjectId(req.user!.id)
      }, {
        $set: { publicKey, rawId }
      })

      res.json({status: 'ok', publicKey, rawId});
    }
    catch(e) {
      console.log('error register', e);
      res.status(401).json({status: 'failed'});
    }
  });

  app.get('/api/authentication-options', isAuthenticated, async (req, res) => {
    const authnOptions = await f2l.assertionOptions();

    req.session.challenge = Buffer.from(authnOptions.challenge);
    authnOptions.challenge = Buffer.from(authnOptions.challenge);

    res.json(authnOptions);
  })

  app.post('/api/authenticate', isAuthenticated, async (req, res) => {
    const {credential} = req.body;

    credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;

    const challenge: string = (req.session.challenge?.data)
    const user = await UserModel.findOne({_id: new ObjectId(req.user!.id) });

    if(user?.publicKey === undefined) {
      res.status(401).json({status: 'non authorized'});
    }
    else {
      const assertionExpectations = {
        challenge,
        origin: 'http://localhost:3000',
        factor: 'either' as Factor,
        publicKey: user?.publicKey,
        userHandle: '',
        prevCounter: 1
      };

      try {
        await f2l.assertionResult(credential, assertionExpectations); // will throw on error

        res.json({status: 'ok'});
      }
      catch(e) {
        console.log('error auth', e);
        res.status(401).json({status: 'failed'});
      }
    }
  });


  // Serve client files
  if(process.env.NODE_ENV === 'production') {
    app.use(express.static('../client/build'));

    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

run();
