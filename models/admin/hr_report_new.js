const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')

const HRReportNew = sequelize.define('hr_report_new',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },       
    month:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    year:{
        type: Sequelize.INTEGER,
        notEmpty: true, 
    },
    month_year:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    agreement:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    license:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    special_hr_comments:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    biller_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    total_number_employee:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    increase_prev_month:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    pf_esic_coverage:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    only_esic_coverage:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    non_covered_employees:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    basic_salary:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    sub_contractor_system:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    one_contractor:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    minimum_wages:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    esic_very_less:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    actual_payment:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    billing:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    employee_codes:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    wage_register:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    payslip:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    back_office_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    form_xvi:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    software_updated:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    software_pending:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    pf_claim:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    pf_jobs:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    date_of_exit:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    tic_renewal:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    new_joinee:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    master_stroke:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    pf_esic_linked:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },     
    back_office_comments:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },      
    executive_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    documentation_status:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    visit_done:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    e_nomination_done:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    e_nomination_pending:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    aadhar_not_seeded:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    employee_field:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    serious_problems:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    supervisor_name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    supervisor_visit:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    supervisor_comments:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    name:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    less_more:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    reason_behind_change:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    statutory_money_came:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    service_charge_came:{
        type: Sequelize.STRING,
        notEmpty: true, 
    }, 
    gst_came:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },  
    billing2:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },       
    special_task:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },      
    our_observation:{
        type: Sequelize.STRING,
        notEmpty: true, 
    },
    document:{
        type: Sequelize.STRING,
    },
    user_id:{
        type: Sequelize.STRING,
    }
});

module.exports = HRReportNew;
