const express = require('express')
const auth = require('../middleware/auth')
const adminController = require('../controllers/adminController')
const companyController = require('../controllers/companyController')
const router = express.Router()

router.get('/', adminController.index);
router.get('/login', adminController.getLogin);
router.get('/dashboard', adminController.getDashboard);
router.post('/login', adminController.postLogin);


//company
router.get('/company-master',auth, companyController.getCompanyMaster);
router.post('/company-master',auth, companyController.postCompanyMaster);
router.post('/searchCompany', companyController.searchCompany);
router.get('/company-master-edit/:id',auth, companyController.getCompanyMasterEdit);
router.post('/company-master-edit',auth, companyController.postCompanyMasterEdit);
router.delete('/removeDirector',auth, companyController.removeDirector);
router.get('/company-master-view/:id', auth,companyController.getCompanyMasterView);
router.get('/company-master-view-documents/:id',auth, companyController.getCompanyMasterViewDocuments);
router.delete('/deleteCompanyDocument',auth, companyController.deleteCompanyDocument);
router.get('/downloadCompanyDetails/:id', auth,companyController.downloadCompanyDetails);
router.get('/downloadClientDetails/:id', auth,companyController.downloadClientDetails);
router.get('/downloadCompanyDocuments/:id',auth, companyController.downloadCompanyDocuments);
router.get('/downloadClientDocuments/:id', auth,companyController.downloadClientDocuments);
module.exports = router;