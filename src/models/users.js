import { pgPool, redisClient, SIXTY_DAYS } from '../connect.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export const create_user = async (req, res) => {
  const { name, email, password, phone_number } = req.body;
  const client = await pgPool.connect();
  const saltRounds = 10

  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const queryText = 'INSERT INTO "User" (name, email, hashed_password, phone_number) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await client.query(queryText, [name, email, hashedPassword, phone_number]);
    const loginInfo = collateLoginInfo(res, result.rows[0].id, name)
    await client.query('COMMIT');
    res.status(201).json({ message: 'User registered successfully', ...loginInfo});
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ message: e.message });
  } finally {
    client.release();
  }
}

export const signin = async (req, res) => {
  
  const { email, password } = req.body

  const user = await lookupUser(res, email)
  if (user == null) { return }

  // Check if password matches.
  try {
    if (await bcrypt.compare(password, user.hashed_password)) {
      // Correct  password. Return userId, user's name, authorization token and refresh token.
      const loginInfo = collateLoginInfo(res, user.id, user.name)
      res.status(200).send({message: 'Successfully logged in!', loginInfo})
    } else {
      // Wrong password.
      res.status(401).send({message: 'The password or email provided does not match our records.' })
    }
  } catch(e) {
    res.status(500).send({ message: e.message })
  }
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

const collateLoginInfo = (res, userId, name) => {
  const iat = Date.now()
  const loginInfo = {userId, name, iat}
  const token = makeJwtToken(userId)
  storeAuthToken(res, token, loginInfo)
  const refreshToken = crypto.randomBytes(64).toString('base64')
  storeRefreshToken(res, refreshToken, userId)
  return {...loginInfo, token, refreshToken }
}

const storeAuthToken = (res, token, loginInfo) => {
  const theKey = "auth:" + token
  redisClient.set(theKey, JSON.stringify(loginInfo), 'EX', SIXTY_DAYS, (err, reply) => {
    if (err) {
      res.status(500).json({ message: e.message })
      console.error(err);
      return;
    }
  });
}

const storeRefreshToken = (res, refreshToken, userId) => {
  const theKey = "refresh:" + refreshToken
  redisClient.set(theKey, userId, 'EX', SIXTY_DAYS, (err, reply) => {
    if (err) {
      res.status(500).json({ message: e.message })
      console.error(err);
      return;
    }
  })
}

const  makeJwtToken = (userId) => {
  const info = { userId }
  return jwt.sign(info, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60d'})
}

const lookupUser = async (res, email) => {
  const client = await pgPool.connect();
  const query = {
    name: 'fetch-user', // Make this a postgres cached query.
    text: 'SELECT * FROM  "User" WHERE email  = $1',
    values: [email]
  }
  try {
    const result = await client.query(query)
    const user = result.rows[0]
    if (!user) {
      res.status(401).send({message: 'Email or password does not match.' })
    } else {
      return user
    }
  } catch(e) {
    res.status(500).send({message: e.message })
    return null
  } finally {
    client.release()
  }
}

