const username = document.getElementById("uname")
const password = document.getElementById("password")
const cPassword = document.getElementById("cPassword")
const error = document.getElementById("error")


document.addEventListener('submit', (e) => {
    let messages = []
    if(username.value === ''){
        messages.push('Username is required')
    }else{
        let regexUsername = /^[a-zA-Z]/
        if(!regexUsername.test(username.value) ){
            messages.push('Username must begin with an alphabetical letter')
        }
        if(username.value.length < 3 ){
            messages.push('Username must be 3 or more alphanumeric characters')
        }

    }
    if(password.value.length < 8 ){
        messages.push('Password must be 8 or more alphanumeric characters')
    }
    let regexPassword = /[*+^$!@#/]/
    if (!regexPassword.test(password.value)){
        messages.push('Password must contain 1 of the following special characters (  / * - + ! @ # $ ^ & * )')
    }
    let regex2Password = /[A-Z]/
    if (!regex2Password.test(password.value)){
        messages.push('Password must contain 1 upper case letter')
    }
    let regex3Password = /[1-9]/
    if (!regex3Password.test(password.value)){
        messages.push('Password must contain 1 number')
    }
    if (password.value !== cPassword.value){
        messages.push('Passwords do not match')
    }
    if (messages.length > 0){
        e.preventDefault()
        error.innerText = messages.join(', ')
    }
})