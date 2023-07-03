const createError = require("http-errors");
const User = require("../Models/User.model");
const { resisterSchema, loginSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const client = require("../helpers/inti_redis");

module.exports = {
  register: async (req, res, next) => {
    try {
      // const {email,password} = req.body;
      // if (!email || !password) {
      //     throw createError.BadRequest()
      // }
      const result = await resisterSchema.validateAsync(req.body);

      const doesExist = await User.findOne({ email: result.email });
      if (doesExist)
        throw createError.Conflict(
          `${result.email} is already been registered`
        );

      const user = new User(result);
      const savedUser = await user.save();
      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id,savedUser.name);
      res.send({ accessToken, refreshToken });
    } catch (err) {
      if (err.isJoi === true) err.status = 422;
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await loginSchema.validateAsync(req.body);
      const user = await User.findOne({ email: result.email });
      if (!user) throw createError.NotFound(`User not resistered`);

      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createError.Unauthorized("Username/password not valid");
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id,user.name);
      res.send({ accessToken, refreshToken });
    } catch (err) {
      if (err.isJoi === true) err.status = 422;
      next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const {userId,userName} = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId,userName);
      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    try {
      if (!req.headers["authorization"]) return next(createError.Unauthorized());
      const authHeader = req.headers["authorization"];
      const bearerToken = authHeader.split(" ");
      const refreshToken = bearerToken[1];
      if (!refreshToken) throw createError.BadRequest();
      const {userId} = await verifyRefreshToken(refreshToken);
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createError.InternalServerError();
        }
        console.log(val);
        res.sendStatus(204);
      });
    } catch (err) {
      next(err);
    }
  },
};
