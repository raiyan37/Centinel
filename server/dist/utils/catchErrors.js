/**
 * Async Error Wrapper
 *
 * CONCEPT: In Express, async errors don't automatically go to error handlers.
 * This wrapper catches errors from async functions and passes them to next().
 *
 * Without this, you'd need try/catch in every controller:
 *
 *   // Without wrapper (verbose):
 *   const getUsers = async (req, res, next) => {
 *     try {
 *       const users = await User.find();
 *       res.json(users);
 *     } catch (error) {
 *       next(error);  // Must manually pass to error handler
 *     }
 *   };
 *
 *   // With wrapper (clean):
 *   const getUsers = catchErrors(async (req, res) => {
 *     const users = await User.find();
 *     res.json(users);
 *   });
 */
export const catchErrors = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
export default catchErrors;
//# sourceMappingURL=catchErrors.js.map