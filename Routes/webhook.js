import { buffer, text, json } from "micro";
import Stripe from "stripe";
import CryptoJS from "crypto-js";
import transporter from "../helpers/nodemailer.js";
import { v4 as uuidv4 } from "uuid";
import User from "../Models/user.js";
import Order from "../Models/orders.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const webhook = async (req, res) => {
  const buf = await buffer(req)
  const sig = req.headers["stripe-signature"] ;
  const endpointSecret = process.env.STRIPE_SECRET_SIGNING;
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (error) {
    console.log("ERROR", error.message);
    return res.status(400).send(`Webhook err : ${error.message}`);
  }

  // Handle the checkout.session.completed event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // console.log(session)

      let isAvailable = await User.findOne({
        email: session.customer_details.email,
      });

      if (isAvailable) {
        // console.log("THE USER: ", isAvailable);
        await Order.findOneAndUpdate(
          { transaction_id: session.id },
          {
            $set: {
              address: JSON.stringify(session.customer_details.address),
              user: isAvailable._id,
            },
          },
          { new: true }
        );
        res.json(JSON.stringify({ received: true }));
      } else {
        var randomstring = Math.random().toString(36).slice(-8);
        const salt = uuidv4();
        const hashed = CryptoJS.SHA1(randomstring + salt).toString(
          CryptoJS.enc.Hex
        );

        let info = {
          name: session.customer_details.name,
          email: session.customer_details.email,
          salt: salt,
          hashed_password: hashed,
          phone: session.customer_details.phone,
          location: JSON.stringify(session.customer_details.address),
        };
        let user = await User.create(info);
        await Order.findOneAndUpdate(
          { transaction_id: session.id },
          {
            $set: {
              address: JSON.stringify(session.customer_details.address),
              user: user._id,
            },
          },
          { new: true }
        );

        transporter.sendMail({
          from: {
            name: process.env.APP_NAME,
            address: process.env.MAIL_FROM_ADDRESS,
          },
          subject: "Lou-Pescadou",
          to: session.customer_details.email,
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html style="width:100%;font-family:lato, \'helvetica neue\', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
                 <head> 
                  <meta charset="UTF-8"> 
                  <meta content="width=device-width, initial-scale=1" name="viewport"> 
                  <meta name="x-apple-disable-message-reformatting"> 
                  <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
                  <meta content="telephone=no" name="format-detection"> 
                  <title>Nouveau modèle de courrier électronique 2019-12-19</title> 
                  <!--[if (mso 16)]>
                    <style type="text/css">
                    a {text-decoration: none;}
                    </style>
                    <![endif]--> 
                  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
                  <!--[if !mso]><!-- --> 
                  <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"> 
                  <!--<![endif]--> 
                  <style type="text/css">
                @media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:20px!important; display:block!important; border-width:15px 25px 15px 25px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
                #outlook a {
                  padding:0;
                }
                .ExternalClass {
                  width:100%;
                }
                .ExternalClass,
                .ExternalClass p,
                .ExternalClass span,
                .ExternalClass font,
                .ExternalClass td,
                .ExternalClass div {
                  line-height:100%;
                }
                .es-button {
                  mso-style-priority:100!important;
                  text-decoration:none!important;
                }
                a[x-apple-data-detectors] {
                  color:inherit!important;
                  text-decoration:none!important;
                  font-size:inherit!important;
                  font-family:inherit!important;
                  font-weight:inherit!important;
                  line-height:inherit!important;
                }
                .es-desk-hidden {
                  display:none;
                  float:left;
                  overflow:hidden;
                  width:0;
                  max-height:0;
                  line-height:0;
                  mso-hide:all;
                }
                </style> 
                 </head> 
                 <body style="width:100%;font-family:lato, \'helvetica neue\', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;"> 
                  <div class="es-wrapper-color" style="background-color:#F4F4F4;"> 
                   <!--[if gte mso 9]>
                      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                        <v:fill type="tile" color="#f4f4f4"></v:fill>
                      </v:background>
                    <![endif]--> 
                   <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;"> 
                     <tr class="gmail-fix" height="0" style="border-collapse:collapse;"> 
                      <td style="padding:0;Margin:0;"> 
                       <table width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                         <tr style="border-collapse:collapse;"> 
                          <td cellpadding="0" cellspacing="0" border="0" style="padding:0;Margin:0;line-height:1px;min-width:600px;" height="0"><img src="https://esputnik.com/repository/applications/images/blank.gif" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;max-height:0px;min-height:0px;min-width:600px;width:600px;" alt width="600" height="1"></td> 
                         </tr> 
                       </table></td> 
                     </tr> 
                     <tr style="border-collapse:collapse;"> 
                      <td valign="top" style="padding:0;Margin:0;"> 
                       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
                         <tr style="border-collapse:collapse;"> 
                          <td style="padding:0;Margin:0;background-color:#65c6ec;" bgcolor="#65c6ec" align="center"> 
                           <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;" width="600" cellspacing="0" cellpadding="0" align="center"> 
                             <tr style="border-collapse:collapse;"> 
                              <td align="left" style="padding:0;Margin:0;"> 
                               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                 <tr style="border-collapse:collapse;"> 
                                  <td width="600" valign="top" align="center" style="padding:0;Margin:0;"> 
                                   <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FFFFFF;border-radius:4px;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff"> 
                                     <tr style="border-collapse:collapse;"> 
                                      <td align="center" style="Margin:0;padding-bottom:5px;padding-left:30px;padding-right:30px;padding-top:35px;"><h1 style="Margin:0;line-height:58px;mso-line-height-rule:exactly;font-family:lato, \'helvetica neue\', helvetica, arial, sans-serif;font-size:48px;font-style:normal;font-weight:normal;color:#111111;">Bienvenue Sur Pescadou!</h1></td> 
                                     </tr> 
                                     <tr style="border-collapse:collapse;"> 
                                      <td bgcolor="#ffffff" align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;"> 
                                       <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                         <tr style="border-collapse:collapse;"> 
                                          <td style="padding:0;Margin:0px;border-bottom:1px solid #FFFFFF;background:rgba(0, 0, 0, 0) none repeat scroll 0% 0%;height:1px;width:100%;margin:0px;"></td> 
                                         </tr> 
                                       </table></td> 
                                     </tr> 
                                   </table></td> 
                                 </tr> 
                               </table></td> 
                             </tr> 
                           </table></td> 
                         </tr> 
                       </table> 
                       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
                         <tr style="border-collapse:collapse;"> 
                          <td align="center" style="padding:0;Margin:0;"> 
                           <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"> 
                             <tr style="border-collapse:collapse;"> 
                              <td align="left" style="padding:0;Margin:0;"> 
                               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                 <tr style="border-collapse:collapse;"> 
                                  <td width="600" valign="top" align="center" style="padding:0;Margin:0;"> 
                                   <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff"> 
                                     <tr style="border-collapse:collapse;"> 
                                      <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-bottom:15px;padding-top:20px;padding-left:30px;padding-right:30px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:18px;font-family:lato, \'helvetica neue\', helvetica, arial, sans-serif;line-height:27px;color:#666666;">Nous sommes ravis que vous commenciez.  Voici votre compte sur Pescado <br>     <br>       Vous avez des questions sur le pescado, nous serions ravis de vous aider ! appuyez simplement sur répondre 
                                      </p></td> 
                                     </tr>
                                     <br> <br>
                                   </table></td> 
                                 </tr> 
                               </table></td> 
                             </tr> 
                             <tr style="border-collapse:collapse;"> 
                              <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:30px;padding-right:30px;"> 
                               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                 <tr style="border-collapse:collapse;"> 
                                  <td width="540" valign="top" align="center" style="padding:0;Margin:0;"> 
                                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                     <tr style="border-collapse:collapse;"> 
                                      
                                       <p style="Margin:0;padding-bottom:15px;padding-top:20px;padding-left:30px;padding-right:30px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:18px;font-family:lato, \'helvetica neue\', helvetica, arial, sans-serif;line-height:27px;color:#666666;">Votre Compte :</p>
                                      
                                      <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:40px;padding-bottom:40px;">
                                        <span class="es-button-border" style="border-style:solid;border-color:#65c6ec;background:#65c6ec;border-width:1px;display:inline-block;border-radius:2px;width:auto;">
                                          <p class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:helvetica, \'helvetica neue\', arial, verdana, sans-serif;font-size:20px;color:#FFFFFF;border-style:solid;border-color:#65c6ec;border-width:15px 25px 15px 25px;display:inline-block;background:#65c6ec;border-radius:2px;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;"> email : ${session.customer_details.email}
                                            <br>
                                            mot de passe :  ${randomstring}
                                        </p>
                                        </span>
                                      </td> 
                                     </tr> 
                                   </table></td> 
                                 </tr> 
                               </table></td> 
                             </tr> 
                           </table></td> 
                         </tr> 
                       </table> 
                       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;"> 
                         <tr style="border-collapse:collapse;"> 
                          <td align="center" style="padding:0;Margin:0;"> 
                           <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;" width="600" cellspacing="0" cellpadding="0" align="center"> 
                             <tr style="border-collapse:collapse;"> 
                              <td align="left" style="padding:0;Margin:0;"> 
                               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                 <tr style="border-collapse:collapse;"> 
                                  <td width="600" valign="top" align="center" style="padding:0;Margin:0;"> 
                                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                     <tr style="border-collapse:collapse;"> 
                                      <td align="center" style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px;"> 
                                       <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;"> 
                                         <tr style="border-collapse:collapse;"> 
                                          <td style="padding:0;Margin:0px;border-bottom:1px solid #F4F4F4;background:rgba(0, 0, 0, 0) none repeat scroll 0% 0%;height:1px;width:100%;margin:0px;"></td> 
                                         </tr> 
                                       </table></td> 
                                     </tr> 
                                   </table></td> 
                                 </tr> 
                               </table></td> 
                             </tr> 
                           </table></td> 
                         </tr> 
                       </table></td> 
                     </tr> 
                   </table> 
                  </div>  
                 </body>
                </html>`,
        });
        res.send(JSON.stringify({ received: true }));
      }
      break;
    case "payement_intent.payement_failed": 
      res.json(JSON.stringify({ received: true }));
      break;
  }
}

export default webhook