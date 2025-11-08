import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import User from "./models/User.js";
dotenv.config();

passport.use(
	"google-login",
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// Tìm hoặc tạo user trong DB
				let user = await User.findOne({
					Linked_accounts: {
						$elemMatch: {
							provider: 'google',
							provider_id: profile.id
						}
					}
				});

				if (!user) {
					done(null, false, { message: "No user linked with this Google account" });
					return;
				}
				// Cập nhật last_login
				const acc = user.Linked_accounts.find(
					(acc) => acc.provider === 'google'
				);

				if (acc) {
					acc.last_login = new Date();
					await user.save();
				}

				// Gửi user
				done(null, { user });

			} catch (err) {
				done(err, null);
			}
		}
	)
);

// passport.use(
// 	"google-link",
// 	new GoogleStrategy(
// 		{
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 			callbackURL: process.env.GOOGLE_CALLBACK_URL_LINK,
// 			passReqToCallback: true,
// 			state: false,
// 		},
// 		async (req, accessToken, refreshToken, profile, done) => {
// 			try {
// 				console.log(profile);
// 				const exists = req.user.Linked_accounts.find(
// 					(acc) => acc.provider === 'google' && acc.provider_id === profile.id
// 				);
// 				if (!exists) {
// 					req.user.Linked_accounts.push({
// 						provider: 'google',
// 						provider_id: profile.id,
// 						linked_at: new Date(),
// 						last_login: new Date(),
// 					});
// 					await req.user.save();
// 				}

// 				done(null, req.user);
// 			} catch (err) {
// 				done(err, null);
// 			}
// 		}
// 	)
// );

passport.use(
	"facebook-login",
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: process.env.FACEBOOK_CALLBACK_URL_LOGIN,
			profileFields: ["id", "displayName", "emails"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({
					Linked_accounts: { $elemMatch: { provider: "facebook", provider_id: profile.id } }
				});
				if (!user) return done(null, false, { message: "Chưa liên kết Facebook." });

				const acc = user.Linked_accounts.find(
					(acc) => acc.provider === 'facebook'
				);
				if (acc) {
					acc.last_login = new Date();
					await user.save();
				}
				done(null, user);
			} catch (err) {
				done(err, null);
			}
		}
	)
);

passport.use(
	"facebook-link",
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: process.env.FACEBOOK_CALLBACK_URL_LINK,
			profileFields: ["id", "displayName", "emails"],
			passReqToCallback: true,
		},
		async (req, accessToken, refreshToken, profile, done) => {
			try {
				const exists = req.user.Linked_accounts.find(
					(acc) => acc.provider === 'facebook' && acc.provider_id === profile.id
				);

				if (!exists) {
					req.user.Linked_accounts.push({
						provider: "facebook",
						provider_id: profile.id,
						linked_at: new Date(),
						last_login: new Date(),
					});
					await req.user.save();
				}

				done(null, req.user);
			} catch (err) {
				done(err, null);
			}
		}
	)
);

export default passport;
