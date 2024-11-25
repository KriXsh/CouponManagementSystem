import { trackMaintenanceActivity } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';
import { coupons } from '../services/index.js';



const handler = (app) => {
    app.all('*', (req, res, next) => {
        trackMaintenanceActivity(req, res, next);
    });

    app.post('/create-coupons',(req, res) =>{
        coupons.createCoupons(req, res)
    })

    app.get('/coupons/:id',(req, res) =>{
        coupons.getCoupons(req, res)
    })

    app.get('/all/coupons',(req, res) =>{
        coupons.getAllCoupons(req, res)
    })

    app.put('/update-coupons/:id',(req, res) =>{
        coupons.updateCoupons(req, res)
    })

    app.delete('/delete-coupons/:id',(req, res)=>{
        coupons.deleteCoupons(req, res)
    })

    app.post('/applicable-coupons',(req, res)=>{
        coupons.getApplicableCoupons(req, res)
    })
    
    app.post('/apply-coupons/:id',(req, res)=>{
        coupons.applyCoupon(req, res)
    })

    


    app.all('*', (req, res) => {
        return standardManageError(req, res, `Endpoint - ${req.url} not found`, 'notImplemented');
    });
}



export { handler };
