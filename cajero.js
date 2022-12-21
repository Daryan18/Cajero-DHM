import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import{getDatabase, ref, set, get, child, update,remove} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC-MiPIWG6tJfDdv9A8IX7zmRiQz9iwN4w",
    authDomain: "dhm-bank.firebaseapp.com",
    projectId: "dhm-bank",
    storageBucket: "dhm-bank.appspot.com",
    messagingSenderId: "399876279133",
    appId: "1:399876279133:web:65cf308941bb09cbc776b4",
  };

window.onload=function(){
    const app = initializeApp(firebaseConfig);
    const db = getDatabase();
    const dbref= ref(db); 
    document.getElementById('swithToReg').onclick=switchToReg;
    document.getElementById('swithToLogin').onclick=switchToLogin;
    document.getElementById('login-btn').onclick=loginValidation;
    document.getElementById('register-btn').onclick=registerValidation;
    function switchToReg(){
        document.getElementById('register-portal').style="display:inline-block";
        document.getElementById('login-portal').style="display:none";
    }
    function switchToLogin(){
        document.getElementById('register-portal').style="display:none";
        document.getElementById('login-portal').style="display:inline-block";
    }

    var accNoPat="^[0-9]{6}$";
    var accPinPat="^[0-9]{4}$";
    function loginValidation(){
        var lAccNo=document.getElementById('lAccNo').value;
        var lAccPin=document.getElementById('lAccPin').value;
        if(lAccNo.match(accNoPat)&& lAccPin.match(accPinPat)){
            portal(lAccNo,lAccPin);
        }else{
            alert("Por favor ingresa los datos correctos");
        }
    }
    function registerValidation(){
        var rAccName=document.getElementById('rAccName').value;
        var rAccNo=document.getElementById('rAccNo').value;
        var rAccPin=document.getElementById('rAccPin').value;
        var rConAccPin=document.getElementById('rConAccPin').value;
        if(rAccName!==null&&rAccNo.match(accNoPat)&&rAccPin.match(accPinPat)&&rAccPin==rConAccPin){
            set(ref(db,"accNo"+rAccNo+"/accPin"+rAccPin+"/accDetails"),{
                name:rAccName,
                avalBal:0
            }).then(()=>{
                alert("Registro exitoso");
            }).catch((error)=>{
                alert("Registro fallido\n"+error);
            });

            set(ref(db,"accNo"+rAccNo+"/received"),{
                receivedAmt:0
            }).then(()=>{
                console.log("received amt updated");
            }).catch((error)=>{
                alert("Actualización de amt recibida falló \n"+error);
            });

        }else{
            alert("Por favor ingresa los datos correctos");
        }
    }
    function portal(accNo,accPin){
        document.getElementById('login-portal').style="display:none";
        document.getElementById('register-portal').style="display:none";
        document.getElementById('portal').style="display:inline-block";

        var name,avalBal,totalBal,receivedAmt,msg;
        get(child(dbref,"accNo"+accNo+"/accPin"+accPin+"/accDetails")).then((snapshot)=>{
            if(snapshot.exists()){
                name=snapshot.val().name;
                avalBal=snapshot.val().avalBal;
                document.getElementById('userName').innerHTML='Bienvenido '+name;
            }else{
                alert("No se encontro informacción");
            }
        }).catch((error)=>{
            alert("error al encontrar datos\n"+error);
        });
        get(child(dbref,"accNo"+accNo+"/received")).then((snapshot)=>{
            if(snapshot.exists()){
                receivedAmt=snapshot.val().receivedAmt;
                totalBal=avalBal+receivedAmt;
                msg="Bienvenido, "+name;
                updtadeAvalBal(msg,totalBal);
                updateReceivedAmt();
            }else{
                alert("no se encontro el monto recibido en la base de datos");
            }
        }).catch((error)=>{
            alert("error al encontrar datos\n"+error);
        });
        function updtadeAvalBal(msg,totalBal){
            update(ref(db,"accNo"+accNo+"/accPin"+accPin+"/accDetails"),{
                avalBal: totalBal
            }).then(()=>{
                alert(msg);
                document.getElementById('totalBal').innerHTML='TotalBal:'+totalBal;
            }).catch((error)=>{
                alert("error\n"+error);
            });
        }
        function updateReceivedAmt(){
            update(ref(db,"accNo"+accNo+"/received"),{
                receivedAmt:0
            }).then(()=>{
                console.log("monto recibido actualizado");
            }).catch((error)=>{
                alert("error\n"+error);
            });
        }
        document.getElementById('deposit-btn').addEventListener('click',deposit);

        function deposit(){
            document.getElementById('deposit-portal').style="display:inline-block";
            document.getElementById('withdraw-portal').style="display:none";

            document.getElementById('dep-submit').addEventListener('click',function(){
                document.getElementById('deposit-btn').removeEventListener('click',deposit);
                var depositAmt=Number(document.getElementById('deposit-amt').value);
                if(depositAmt>=100){
                    totalBal+=depositAmt;
                    document.getElementById('deposit-amt').value='';
                    msg="Rs."+depositAmt+"depósito realizado con éxito";
                    updtadeAvalBal(msg,totalBal);
                }else{
                    alert('El monto mínimo de deposito son $100');
                }

            });
        }

        document.getElementById('withdraw-btn').addEventListener('click',withdraw);
        function withdraw(){
            document.getElementById('deposit-portal').style="display:none";
            document.getElementById('withdraw-portal').style="display:inline-block";

            document.getElementById('wit-submit').addEventListener('click',function(){
                document.getElementById('withdraw-btn').removeEventListener('click',withdraw);
                var withdrawAmt=Number(document.getElementById('withdraw-amt').value);
                if(withdrawAmt>=100){
                    totalBal-=withdrawAmt;
                    document.getElementById('withdraw-amt').value='';
                    msg="Rs."+withdrawAmt+"retiro realizado con éxito";
                    updtadeAvalBal(msg,totalBal);
                }else{
                    alert('El monto mínimo de retiro son $100');
                }

            });
        }

    }
}