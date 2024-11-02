const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // validation check
      //if everything alright next() ->
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validateRequest;
