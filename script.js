function mapScript() {
  const mymap = L.map('mapid').setView([38.99, -76.94], 12);
  
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGVtaXNzaWUiLCJhIjoiY2ttNnBsazlsMDFnNDJ6bzI5ZzRkZ2tpZSJ9.Hink3UAhOu_4EjeNmOQBvw'
  }).addTo(mymap);

  return mymap;
}

async function dataFilter(mapFromMapFunction) {
  const form = document.querySelector('#search-form');
  const search = document.querySelector('#search');
  const targetList = document.querySelector('.target-list');
  const replyMessage = document.querySelector('reply-message');

  const request = await fetch('https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json');
  const data = await request.json();

  form.addEventListener('submit', async(event) => {
    targetList.innerText = '';

    event.preventDefault();
    console.log('submit fired', search.value);
    const filtered = data.filtered = data.filter((record) => record.zip.includes(search.value) && record.geocoded_column_1);
    const topFive = filtered.slice(0, 5);

    if (topFive.length < 1) {
      replyMessage.classList.add('box');
      replyMessage.innerText = 'No match found';
    }
    console.table('Top five', topFive);

    topFive.forEach((item) => {
      const longlat = item.geocoded_column_1.coordinates;
      console.log('markerLongLat', longlat[0], longlat[1]);
      const marker = L.marker([longlat[1], longlat[0]]).addTo(mapFromMapFunction);
      
      const appendItem = document.createElement('li');
      appendItem.classList.add('block');
      appendItem.classList.add('list-item');
      appendItem.innerHTML = `<div class="list-header is-size-5">${item.name}</div><address class="is-size-6">${item.address_line_1}</address>`;
      targetList.append(appendItem);
    });

    const {coordinates} = topFive[0]?.geocoded_column_1;
    console.log('viewSet coords', coordinates);
    mapFromMapFunction.panTo([coordinates[1], coordinates[0]], 0);
  });

  search.addEventListener('input', (event) => {
    console.log('input', event.target.value);
    if (search.value.length === 0) {
      replyMessage.innerText = '';
      replyMessage.classList.remove('box');
    }
  });
}

async function windowActions() {
  console.log('window loaded');
  const mapObject = mapScript();
  await dataFilter(mapObject);
}

window.onload = windowActions;