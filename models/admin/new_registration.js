const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const NewRegistration = sequelize.define('new_registration',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    date_of_joining:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    emp_code:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    client_code:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    emp_title:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    emp_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    father_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    dob:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    gender:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    address:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    state:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    pin:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    mobile:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },   
    email:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },     
    aadhar:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    pan:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    maritial_status:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    bank_ac:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    bank_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    ifsc:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    beneficiary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    pf:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    esic:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    date_of_exit:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    remarks:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },     
    nominee_name:{
        type: Sequelize.STRING,
    },      
    nominee_relation:{
        type: Sequelize.STRING,
    },     
    nominee_dob:{
        type: Sequelize.STRING,
    },     
    nominee_share:{
        type: Sequelize.STRING,
    },     
    remarks:{
        type: Sequelize.STRING,
    }, 
    type:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    designation:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },   
    basic_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },   
    hra:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },       
    gross_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    photo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    aadhar_photo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    pan_photo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    bank_passbook_photo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    family_photo:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    appointment:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },      
    signature:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    tic:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },    
    username:{
        type: Sequelize.STRING,
    },     
    user_id:{
        type: Sequelize.STRING,
    },       
    date:{
        type: Sequelize.DATEONLY,
    },   
    time:{
        type: Sequelize.TIME,
    }, 
});

module.exports = NewRegistration;
