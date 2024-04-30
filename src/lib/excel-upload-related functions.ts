export const lastFourMonts=async()=>{
    const today = new Date();
    const fourMonthsAgo = new Date(today);
    fourMonthsAgo.setUTCMonth(today.getUTCMonth() - 4);
   

   return fourMonthsAgo.toISOString();
  }

  
export const  containsNumbers=(str:string)=> {
    return /\d/.test(str);
  }

 export  const ImageFinding =  (loan_agreement_no:string,regNo:string,eventDataVehicls:any[]) => {
    let foundVehicle=null;
    const verifyAgreement=containsNumbers(loan_agreement_no)
    const verifyRegNo=containsNumbers(regNo)
  
    if (verifyAgreement) {
       foundVehicle = [...eventDataVehicls].reverse().find((vehicle) => loan_agreement_no === vehicle?.loanAgreementNumber);   
    }
    else if (verifyRegNo) {
       foundVehicle = [...eventDataVehicls].reverse().find((vehicle) => regNo === vehicle?.registerNumber);  
    }
   
    return foundVehicle?.frontImage
  };