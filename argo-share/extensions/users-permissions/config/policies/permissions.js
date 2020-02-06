// Overrides the default JWT authentication plugin policy to give public access.
// Use additional policies to require authentication
module.exports = async (ctx, next) => {
    await next();
};
