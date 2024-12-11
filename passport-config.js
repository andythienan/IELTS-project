const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User"); // Import the User model

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      const user = await User.findOne({ email }); // Find user by email in MongoDB
      if (!user) {
        return done(null, false, { message: "No user with that email" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "email" }, authenticateUser)
  );

  passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize by user ID
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id); // Find user by ID in MongoDB
      done(null, user);
    } catch (error) {
      console.error("Error during deserialization:", error);
      done(error, null);
    }
  });
}

module.exports = initialize;
