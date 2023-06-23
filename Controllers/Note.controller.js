const createError = require("http-errors");
const mongoose = require("mongoose");

const Note = require("../Models/Note.model");
const { verifyValidAccessToken } = require("../helpers/jwt_helper");
const { response } = require("express");

module.exports = {
  gettingAllNotes: async (req, res, next) => {
    try {
      const result = await Note.find({ userId: req.payload.aud }, { __v: 0 });
      if (!result) {
        throw createError(404, "Product does not exist");
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
    }
  },
  gettingANote: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await Note.findById(id);
      if (!result) {
        throw createError(404, "Product does not exist");
      }
      const userId = req.payload.aud;
      if (result.userId === userId) {
        res.send(result);
      } else {
        throw createError(404, "Product does not exist"); // here we hiding UnauthorizedError due to security proposes
      }
    } catch (err) {
      console.log(err.message);
      if (err instanceof mongoose.CastError) {
        return next(createError(400, "Invalid Product Id"));
      }

      next(err);
    }
  },
  createNewNote: async (req, res, next) => {
    try {
      const { accessToken, name, text } = req.body;
      if (!accessToken) throw createError.BadRequest();
      const userId = await verifyValidAccessToken(accessToken);

      const note = new Note({
        userId: userId,
        name: req.body.name,
        text: req.body.text,
      });
      const result = await note.save();
      res.send(result);
    } catch (err) {
      console.log(err);
      if (err.name === "ValidationError") {
        next(createError(422, err.message));
        return;
      }
      next(err);
    }
  },
  updateANote: async (req, res, next) => {
    try {
      const productId = req.params.id;

      const { accessToken } = req.body;
      if (!accessToken) throw createError.BadRequest();
      const userId = await verifyValidAccessToken(accessToken);

      const product = await Note.findById(productId);
      if (!product) {
        throw createError(404, "Product does not exist");
      } else {
        if (userId === product.userId) {
          const updates = req.body;
          const options = { new: true };
          const result = await Note.findByIdAndUpdate(
            productId,
            updates,
            options
          );
          res.send(result);
        } else {
          throw createError.Unauthorized();
        }
      }
    } catch (err) {
      console.log(err.message);
      if (err instanceof mongoose.CastError) {
        return next(createError(400, "Invalid Product Id"));
      }
      next(err);
    }
  },
  deleteANote: async (req, res, next) => {
    try {
      const productId = req.params.id;
      const { accessToken } = req.body;
      if (!accessToken) throw createError.BadRequest();
      const userId = await verifyValidAccessToken(accessToken);
      const product = await Note.findById(productId);
      if (!product) {
        throw createError(404, "Product does not exist");
      } else {
        if (userId === product.userId) {
          const result = await Note.findByIdAndDelete(product.id);
          res.send(result);
        } else {
          throw createError.Unauthorized();
        }
      }
    } catch (err) {
      console.log(err.message);
      if (err instanceof mongoose.CastError) {
        next(createError(400, "Invalid Product id"));
        return;
      }
      next(err);
    }
  },
};
