const dropZone=document.querySelector(".drop-zone")
const browsebtn=document.querySelector(".browsebtn")
const fileinput=document.querySelector("#fileinput")
const bgprogress=document.querySelector(".bg-progress")
const progressbar=document.querySelector(".progress-bar")
const progresscontainer=document.querySelector(".progress-container")

const percentdiv=document.querySelector("#percent")
const fileURLInput=document.querySelector("#fileURL")
const sharingcontainer=document.querySelector(".sharing-container")
const copybtn=document.querySelector("#copybtn")
const emailform=document.querySelector("#emailform")
const toast=document.querySelector(".toast")
const maxallowedsize=100*1024*1024;
const host="https://inshare0.herokuapp.com/";
const uploadurl=`${host}api/files`;
const emailurl=`${host}api/files/send`;

dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault()

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});
dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged")
});
dropZone.addEventListener("drop",(e)=>{
    e.preventDefault()
    dropZone.classList.remove("dragged");
    const files=e.dataTransfer.files;
    //console.log(files);
   
    if(files.length){
        fileinput.files=files;
        uploadfile();
        //
    }
});
fileinput.addEventListener("change",()=>{
    uploadfile();
})
browsebtn.addEventListener("click",()=>{
    fileinput.click();
})
copybtn.addEventListener("click",()=>{
    fileURLInput.select()
    document.execCommand("copy")
    showtoast("Link copied")
});
const uploadfile=()=>{
    progresscontainer.style.display="block";
    if(fileinput.files.length>1){
        fileinput.value="";
        showtoast("Only upload 1 file!")
        return;
    }
    const file=fileinput.files[0];
    if(file.size>maxallowedsize){
        fileinput.value="";
        showtoast("Can't upload file of size more than 100mb");
        return
    }
    //const file=fileinput.files[0]
    const formdata=new FormData();
    formdata.append("myfile",file);

    const xhr=new XMLHttpRequest();
    xhr.onreadystatechange=()=>{
        if(xhr.readyState===XMLHttpRequest.DONE){
            console.log(xhr.response);
            onuploadsuccess(JSON.parse(xhr.response))
        }
       //console.log(xhr.readyState); 
    };
    xhr.upload.onprogress=updateProgress;
    xhr.upload.onerror=()=>{
        fileinput.value="";
        showtoast(`Error in upload:${xhr.statusText}`)
    }
    xhr.open("POST",uploadurl);
    xhr.send(formdata);
    
};
const updateProgress=(e)=>{
    const percent=Math.round((e.loaded/e.total)*100);
    //console.log(percent);
    bgprogress.getElementsByClassName.width=`${percent}%`
    percentdiv.innerText=percent;
    progressbar.style.transform=`scaleX(${percent/100})`
};
const onuploadsuccess=({file: url})=>{
    console.log(url);
    fileinput.value="";
    emailform[2].removeAttribute("disabled");

    progresscontainer.style.display="none"
    sharingcontainer.style.display="block"
    fileURLInput.value=url;
};
emailform.addEventListener("submit",(e)=>{
    e.preventDefault()
    console.log("Submit form")
    const url=fileURLInput.value;

    const formdata={
        uuid: url.split("/").splice(-1,1)[0],
        emailTo:emailform.elements["to-email"].value,
        emailFrom:emailform.elements["from-email"].value,
    };
    emailform[2].setAttribute("disabled","true");
    console.table(formdata)
    fetch(emailurl,{
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formdata)
    }).then((res)=>res.json()).then(({success})=>{
        if(success){
            sharingcontainer.style.display="none";
            showtoast("Email sent")
        }
    });
});

let toasttimer;
const showtoast=(msg)=>{
    toast.innerText=msg;
    toast.style.transform="translate(-50%,0)";
    clearTimeout(toasttimer);
    toasttimer=setTimeout(()=>{
        toast.style.transform="translate(-50%,60px)";
    }, 2000);
};