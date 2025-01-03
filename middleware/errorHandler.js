
module.exports = (err,req,res,next) =>{

    console.log(err);
   res.status(500).
   render('500error',
   {pageTitle:'Something Went Wrong',
   path:'..',
   isLoggedIn:false,
err:err});

};