var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var auth = require("../modules/auth");
var authorisation = require("../modules/authorisation");

// router.get("/", function (req, res, next) {
//   res.send("auth goes here");
// });

router.get("/login", auth, function (req, res, next) {
  try {
    console.log("HYT528 login");
    const packageJson = require("../package.json");
    const status = {
      appName: packageJson.name,
      version: packageJson.version,
    };
    if (authorisation.check(req.userInfo, { role: "operator" })) {
      status.database = global.gConfig.dbdatabase;
    }
    status.environment = global.gConfig.config_id;
    // console.log("LGN221 server login authorise status", status);
    res.send(status);
  } catch (e) {
    console.log("FUT628 login fail ERROR", e);
  }
});

//NB This is a FAKE login page and must not be available in PROD
router.post("/signin", async function (req, res, next) {
  // console.time("ABC123 login")
  if (global.gConfig.config_id == "prod") {
    //login not permitted for PROD
    console.log("VFD3456 signin fail");
    res.status(401).send("DEV login fail c");
  } else {
    try {
      const user_ID = "UI_" + req.body.user_ID;
      const FI = req.body.FI;
      const email = req.body.email;
      const password = req.body.password;
      const SubGroup = req.body.SubGroup;
      const SubGroup1 = req.body.SubGroup1;
      let GivenName = "Jane";
      let Surname = "Bloggs";
      console.log("MGE28 signin", user_ID, FI, SubGroup, email);
      let ok = password.toLowerCase() == "greenunicorn1990";
      let Group;
      switch (user_ID.toLowerCase()) {
        case "ui_user":
          Group = [SubGroup + "PSMSOP.Member" + FI + ".Primary", SubGroup1 + "PSMSOP.Member" + FI + ".Primary"];
          GivenName = "Alex";
          Surname = "Member-MichaelKKK";
          break;
        case "ui_operator":
          Group = [SubGroup + "PSMSOP.Operational Owner"];
          GivenName = "Albert";
          Surname = "Operator-Blue";
          break;
        case "ui_admin":
          Group = [SubGroup + "PSMSOP.Business Owner"];
          GivenName = "George";
          Surname = "Admin-Blue";
          break;
        case "ui_kumar":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "SKumar1@cuscal.com.au",
              Group: ["NPPPSMSOP.MemberCRU.Primary"],
              Email: "SKumar1@cuscal.com.au",
              GivenName: "Fake",
              Surname: "Kumar",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GFD222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          case "ui_bad":
            jwt.sign(
              {
                aud: "www.auspaynet.com.au",
                sub: "bad@cuscal.com.au",
                Group: ["NPPPSMSOP.MemberCRU.Primary"],
                Email: "badguy@cuscal.com.au",
                GivenName: "Fake",
                Surname: "Kumar",
              },
              global.gConfig.TOKEN_KEY,
              { expiresIn: 8 * 60 * 60 }, //seconds
              (err, token) => {
                if (err) {
                  console.log("GFD222 login fail", err);
                  res.status(500).json({ err: err });
                } else {
                  res.json({ jwt: token+"ZZZ" });//dud token (deliberate)
                }
              }
            );
          return;
        case "ui_vesna":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "vesna.kotevska@ing.com.au",
              Group: [
                "CS2PSMSOP.MemberGNI.Primary",
                "CS1PSMSOP.MemberGNI.Primary",
                "NPPPSMSOP.MemberING.Primary",
                "IACPSMSOP.MemberING.Primary",
                "CS2PSMSOP.MemberING.Primary",
                "CS1PSMSOP.MemberING.Primary",
              ],
              Email: "vesna.kotevska@ing.com.au",
              GivenName: "Vesna",
              Surname: "Kotevska",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GFD222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          // console.timeEnd("ABC123 login")
          return;
        case "ui_michael":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "michael.nguyen@tillpayments.com",
              Group: ["IACPSMSOP.MemberTIL.Primary"],
              Email: "michael.nguyen@tillpayments.com",
              GivenName: "Michael",
              Surname: "Nguyen",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GFD222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          // console.timeEnd("ABC123 login")
          return;
        case "ui_jon":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "Jonathan.Leung@cba.com.au",
              Group: [
                "NPPPSMSOP.MemberCBA.Primary",
                "CS1PSMSOP.MemberCBA.Primary",
                "IACPSMSOP.MemberCBA.Primary",
                "CS2PSMSOP.MemberCBA.Primary",
              ],
              Email: "Jonathan.Leung@cba.com.au",
              GivenName: "Jonathan",
              Surname: "Leung",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GFD222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          // console.timeEnd("ABC123 login")
          return;
        case "ui_asl":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "alanTest.@asl.com.au",
              Group: [
                "CS2PSMSOP.MemberASL.Primary",
                "CS1PSMSOP.MemberASL.Primary",
                "NPPPSMSOP.MemberASL.Primary",
                "IACPSMSOP.MemberASL.Primary",
                "CS2PSMSOP.MemberASL.Primary",
                "CS1PSMSOP.MemberASL.Primary",
              ],
              Email: "alanTest@asl.com.au",
              GivenName: "Alan",
              Surname: "Test",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GJJ222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          // console.timeEnd("ABC123 login")
          return;
        case "ui_boc":
          jwt.sign(
            {
              aud: "www.auspaynet.com.au",
              sub: "alanTest.@asl.com.au",
              Group: [
                "CS2PSMSOP.MemberBOC.Primary",
                "CS1PSMSOP.MemberBOC.Primary",
                "NPPPSMSOP.MemberBOC.Primary",
                "IACPSMSOP.MemberBOC.Primary",
                "CS2PSMSOP.MemberBOC.Primary",
                "CS1PSMSOP.MemberBOC.Primary",
              ],
              Email: "alanTest@BOC.com.au",
              GivenName: "James",
              Surname: "Test",
            },
            global.gConfig.TOKEN_KEY,
            { expiresIn: 8 * 60 * 60 }, //seconds
            (err, token) => {
              if (err) {
                console.log("GJJ222 login fail", err);
                res.status(500).json({ err: err });
              } else {
                res.json({ jwt: token });
              }
            }
          );
          // console.timeEnd("ABC123 login")
          return;

        default:
          ok = false;
      }
      console.log("MGE256 signIn OK=", ok, "user_ID", user_ID, "FI", FI, "SubGroup", SubGroup, "Group", Group, email);

      if (ok) {
        //build jwt

        jwt.sign(
          {
            aud: "joey.com",
            sub: email,
            Group: Group,
            Email: email,
            GivenName: GivenName,
            Surname: Surname,
          },
          global.gConfig.TOKEN_KEY,
          { expiresIn: 8 * 60 * 60 }, //seconds
          (err, token) => {
            if (err) {
              console.log("GFD222 login fail", err);
              res.status(500).json({ err: err });
            } else {
              //console.log("GTR442 login ok. JWT created")
              res.json({ jwt: token });
            }
          }
        );
        // console.timeEnd("ABC123 login")
      } else {
        //login failed
        console.log("VFD3456 fail", user_ID);
        res.status(401).send("DEV login fail d");
      }
    } catch (err) {
      console.log("MNG663", err);
      res.status(500).json({ err: err });
    }
  }
});

module.exports = router;
