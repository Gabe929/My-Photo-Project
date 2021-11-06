function fadeOut(data){
    let op = 1;
    let timer = setInterval(function (){
        if (op < 0){
            clearInterval(timer);
            data.remove();
        }
        data.style.opacity = op
        op -= .1
    })
    count = count - 1
    document.getElementById('items-count').innerHTML = "There are " + count + " photo(s) being shown";
}
function createPhotoCard(data){
    let div = document.createElement('div');
    let img = document.createElement('img');
    let label = document.createElement('label');

    img.src = data.url;
    img.width = "200"
    img.height = "200"
    label.innerHTML = "<br>" + data.title;

    div.appendChild(img);
    div.appendChild(label);

    div.onclick = function(){fadeOut(div)}
    mainDiv.appendChild(div)
}

let mainDiv = document.getElementById('container')
if(mainDiv){
    let fetchURL = 'https://jsonplaceholder.typicode.com/albums/2/photos';
    fetch(fetchURL)
    .then((data) => data.json())
    .then((photos) => {
        let innerHTML = "";
        count = photos.length
        photos.forEach((photo) => {
            createPhotoCard(photo);
        })
        document.getElementById('items-count').innerHTML = "There are " + count + " photo(s) being shown";
    })
}