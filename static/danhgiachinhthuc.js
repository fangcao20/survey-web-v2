$(document).ready(function () {
//change selectboxes to selectize mode to be searchable
   $("select").select2();
});
sendData()
let data = {
    'nhomcauhoi': ''
}

var bienXoa = [];
var ketquahoiquy = [];
var ketquakhacbiet = [];
var ketquathongkemota = {};
sendDataSoBo(data, 'nhomcauhoi');
sendDataSoBo({'bien_xoa': []}, 'xoabien');
function sendData(data, action) {
  $.ajax({
    url: '/danhgiasobo',
    method: 'POST',
    data: JSON.stringify({ data: data, action: action }),
    contentType: 'application/json',
    success: function(response) {
      if (response.tennhom) {
        hienNhomCauHoi(response.tennhom);
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
}
function sendDataSoBo(data, action) {
  $.ajax({
    url: '/danhgiasobo',
    method: 'POST',
    data: JSON.stringify({ data: data, action: action }),
    contentType: 'application/json',
    success: function(response) {
      if (response.message) {
        alert(response.message);
      }
      if (response.cronbach_total) {
          cronbachalalpha = response.cronbach_total.toFixed(3);
          document.getElementById('crbalpha').innerHTML = cronbachalalpha;
          if (cronbachalalpha < 0.7){
            document.getElementById('crbalpha').style.backgroundColor = '#ffe5ea';
            document.getElementById('crbalpha').style.color = '#d64b4b';
          } else {
            document.getElementById('crbalpha').style.backgroundColor = 'white';
            document.getElementById('crbalpha').style.color = 'black';
          };

          document.getElementById('comau').innerHTML = response.comau;
          document.getElementById('soluongbien').innerHTML = response.soluongbien;
          hienthi_cronbach(response.cronbach_table);

          let ev = response.ev;
          let binhphuong = response.binhphuong;
          let tile = response.tile;
          let tichluy = response.tichluy;
          let factorNum = binhphuong.length;
          let html = '';
          for (let factor = 0; factor < factorNum - 1; factor++) {
            html += `
                <tr>
                    <th scope="row">${factor + 1}</th>
                    <td>${parseFloat(ev[factor]).toFixed(3)}</td>
                    <td>${parseFloat(binhphuong[factor]).toFixed(3)}</td>
                    <td>${parseFloat(tile[factor]).toFixed(3)}</td>
                    <td>${parseFloat(tichluy[factor]).toFixed(3)}</td>
                </tr>
            `;

          };
          factor = factorNum - 1;
          html += `
            <tr>
                <th scope="row">${factor + 1}</th>
                <td style="color: #d64b4b; background: #fff2cc;">${parseFloat(ev[factor]).toFixed(3)}</td>
                <td>${parseFloat(binhphuong[factor]).toFixed(3)}</td>
                <td>${parseFloat(tile[factor]).toFixed(3)}</td>
                <td style="color: #d64b4b; background: #fff2cc;">${parseFloat(tichluy[factor]).toFixed(3)}</td>
            </tr>
          `;
          html += `
            <tr>
                <th scope="row">${ev.length}</th>
                <td>${parseFloat(ev[ev.length - 1]).toFixed(3)}</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
          `;
          document.getElementById('bodyphuongsai').innerHTML = html;
          document.getElementById('kmo').innerHTML = parseFloat(response.kmo).toFixed(3);
          document.getElementById('bartlett').innerHTML = parseFloat(response.p_value).toFixed(3);
          if (response.matran) {
            document.getElementById('matranxoay').style.display = 'block';
            hienthimatranxoay(response.matran, factorNum);
          } else {
            document.getElementById('matranxoay').style.display = 'none';
          }
        }
        if (response.nhantodaidien) {
            hienthinhantodaihien(response.nhantodaidien, response.soluongnhantodoclap);
            hienthituongquan(response.tuongquan, response.soluongnhantodoclap);
            ketquathongkemota = response.ketquathongkemota;
            hienthibangthongkemota(response.ketquathongkemota);
        }
        if (response.ketquahoiquy) {
            hienthichonbien(response.ketquahoiquy)
            ketquahoiquy = response.ketquahoiquy;
            ketquakhacbiet = response.ketquakhacbiet;
            console.log(ketquakhacbiet);
            hienthibiendoclap(response.ketquakhacbiet);
        }
      },
      error: function(error) {
      console.log(error);
    }
  });
}

function hienNhomCauHoi(tennhom) {
    let html = '<option value="">Chọn nhóm câu hỏi...</option>';
    for (let nhom of tennhom) {
        html += `<option>${nhom}</option>`;
    }
    document.getElementById('chonnhomcauhoi').innerHTML = html;
}

var nhomcauhoi;
function chon_nhom() {
    let select = document.getElementById('chonnhomcauhoi');
    let option = select.options[select.selectedIndex];
    nhomcauhoi = option.text;
    if (option.value === ""){
        nhomcauhoi = '';
    };
    let data = {
        'bien_xoa': bienXoa,
        'nhomcauhoi': nhomcauhoi,
    }
    sendDataSoBo(data, 'nhomcauhoi');
}

function hienthi_cronbach(table) {
    let columns = table.columns;
    let htmlHead = '<tr><th>STT</th>';
    for (col of columns) {
        htmlHead += `<th>${col}</th>`;
    }
    document.getElementById('headCron').innerHTML = htmlHead;
    let htmlBody = '';
    for (let i = 1; i < Object.keys(table).length; i++) {
        let row = '';
        if (parseFloat(table[i][3]) < 0.3) {
            row = `<th style="background: #ffe5ea; color: #d64b4b" scope="row">${i}</th>
                    <td style="background: #ffe5ea; color: #d64b4b">${table[i][0]}</td>`;
        } else {
            row = `<th scope="row">${i}</th>
                    <td>${table[i][0]}</td>`;
        }
        for (let col = 1; col < table.columns.length; col++) {
            if (parseFloat(table[i][3]) < 0.3) {
                row += `<td style="background: #ffe5ea; color: #d64b4b">${parseFloat(table[i][col]).toFixed(3)}</td>`;
            } else {
                row += `<td>${parseFloat(table[i][col]).toFixed(3)}</td>`;
            }
        }
        htmlBody += `<tr id=row${i}>${row}</tr>`;
    }
    document.getElementById('bodyCron').innerHTML = htmlBody;
}


function tam_xoa(n) {
    let row = document.getElementById(`row${n}`);
    let ten_bien = row.getElementsByTagName('td')[0].innerHTML;
    bienXoa.push(ten_bien);
    if (nhomcauhoi === undefined) {
        nhomcauhoi = '';
    }
    let data = {
        'bien_xoa': bienXoa,
        'nhomcauhoi': nhomcauhoi
    }
    localStorage.setItem('bien_xoa', JSON.stringify(bienXoa));
    sendDataSoBo(data, 'nhomcauhoi');
}

function hienthimatranxoay(matran, factorNum){
    let numRow = Object.keys(matran).length;
    let head = '<th>STT</th><th>Biến</th>';
    for (let factor = 1; factor <= factorNum; factor++){
        head += `<th>Nhân tố ${factor}</th>`
    };
    document.getElementById('headmatranxoay').innerHTML = head;

    let body = '';
    let rowhtml = '';
    for (let row = 1; row <= numRow; row++){
        rowhtml = `<th>${row}</th>`
        rowhtml += `<th scope="row">${matran[row][0]}</th>`;
        for (let factor = 1; factor <= factorNum; factor++){
            if (parseFloat(matran[row][factor]) > 0.5){
                rowhtml += `<td style="color: #d64b4b; background: #fff2cc;">${parseFloat(matran[row][factor]).toFixed(3)}</td>`;
            } else {
                rowhtml += `<td>${parseFloat(matran[row][factor]).toFixed(3)}</td>`;
            };
        };
        body += `<tr>${rowhtml}</tr>`;
    };
    document.getElementById('bodymatranxoay').innerHTML = body;
};

function cronbach(){
    change_tab('cronbachalpha');
    document.getElementById('hienthicronbach').style.display = 'block';
};

function nhantokhampha(){
    change_tab('efa');
    document.getElementById('hienthiefa').style.display = 'block';
};

function tuongquantuyentinh() {
    change_tab('tuongquan');
    document.getElementById('hienthituongquan').style.display = 'block';
}

function hoiquydabien() {
    change_tab('hoiquy');
    document.getElementById('hienthihoiquy').style.display = 'block';
}

function sukhacbiet() {
    change_tab('khacbiet');
    document.getElementById('hienthikhacbiet').style.display = 'block';
}

function thongkemota() {
    change_tab('mota');
    document.getElementById('hienthithongkemota').style.display = 'block';
}

function change_tab(id) {
    let navs = document.querySelectorAll('#content > ul > li > a');
    for (nav of navs) {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            nav.removeAttribute('aria-current');
        }
    }
    let link = document.getElementById(id);
    link.classList.add('active');
    link.setAttribute("aria-current", "page");
    let divs = document.querySelectorAll('#content > div');
    for (div of divs) {
        div.style.display = 'none';
    }
}

function hienthinhantodaihien(nhantodaidien, soluongnhantodoclap) {
    let head = '<th>STT</th>';
    for (let factor = 1; factor <= nhantodaidien[0].length; factor++){
        if (factor > soluongnhantodoclap) {
            head += `<th style="background: #bed6c7">Nhân tố ${factor-soluongnhantodoclap}_PT</th>`;
        } else {
            head += `<th>Nhân tố ${factor}_ĐL</th>`;
        }
    };
    document.getElementById('headnhantodaidien').innerHTML = head;

    let htmlBody = '';
    let rowhtml = '';
    let numRow = nhantodaidien.length;
    let i = 1;
    for (let row of nhantodaidien){
        rowhtml = `<th>${i}</th>`
        for (let factor = 0; factor < row.length; factor++){
            rowhtml += `<td>${row[factor]}</td>`;
        };
        htmlBody += `<tr>${rowhtml}</tr>`;
        i++;
    };
    document.getElementById('bodynhantodaidien').innerHTML = htmlBody;
}

function hienthituongquan(tuongquan, soluongnhantodoclap) {
    let head = '<th></th>';
    for (let factor = 1; factor <= tuongquan[0].length; factor++){
        if (factor > soluongnhantodoclap) {
            head += `<th style="background: #bed6c7">Nhân tố ${factor-soluongnhantodoclap}_PT</th>`;
        } else {
            head += `<th>Nhân tố ${factor}_ĐL</th>`;
        }
    };
    document.getElementById('headTuongquan').innerHTML = head;

    let htmlBody = '';
    let i = 1;
    for (row of tuongquan) {
        let rowhtml;
        if (i > soluongnhantodoclap) {
            rowhtml = `<th scope="row" style="background: #bed6c7">Nhân tố ${i-soluongnhantodoclap}_PT</th>`;
        } else {
            rowhtml = `<th scope="row">Nhân tố ${i}_ĐL</th>`;
        }
        let numCol = row.length;
        for (let col=0; col < numCol; col++) {
            if (row[col] < 0) {
                rowhtml += `
                    <td style="background: #485696;">${parseFloat(row[col]).toFixed(3)}</td>
                `;
            } else if (row[col] < 0.25) {
                rowhtml += `
                    <td style="background: #E7E7e7;">${parseFloat(row[col]).toFixed(3)}</td>
                `;
            } else if (row[col] < 0.5) {
                rowhtml += `
                    <td style="background: #f9c784;">${parseFloat(row[col]).toFixed(3)}</td>
                `;
            } else if (row[col] < 0.75) {
                rowhtml += `
                    <td style="background: #fc7a1e;">${parseFloat(row[col]).toFixed(3)}</td>
                `;
            } else if (row[col] < 1){
                rowhtml += `
                    <td style="background: #f24c00;">${parseFloat(row[col]).toFixed(3)}</td>
                `;
            } else {
                rowhtml += `
                    <td>${parseFloat(row[col]).toFixed(3)}</td>
                `;
            }
        }
        i++;
        htmlBody += `<tr>${rowhtml}</tr>`;
    }
    document.getElementById('bodyTuongquan').innerHTML = htmlBody;
}

function efabiendoclap() {
    if (nhomcauhoi === undefined) {
        nhomcauhoi = '';
    }
    let data = {
        'bien_xoa': bienXoa,
        'nhomcauhoi': nhomcauhoi,
        'loaibien': 'biendoclap'
    }
    sendDataSoBo(data, 'nhomcauhoi');
}

function efabienphuthuoc() {
    if (nhomcauhoi === undefined) {
        nhomcauhoi = '';
    }
    let data = {
        'bien_xoa': bienXoa,
        'nhomcauhoi': nhomcauhoi,
        'loaibien': 'bienphuthuoc'
    }
    sendDataSoBo(data, 'nhomcauhoi');
}

function hienthichonbien(ketquahoiquy) {
    let bienphuthuoc = ketquahoiquy['bienphuthuoc'];
    let htmlchonbien = '';
    for (let i=1; i <= bienphuthuoc.length; i++) {
        htmlchonbien += `<option value='${i}'>Nhân tố ${i}_PT</option>`;
    }
    document.getElementById('chonbienphuthuoc').innerHTML = htmlchonbien;
    hienthihoiquy(ketquahoiquy);
}

function hienthihoiquy(ketquahoiquy) {
    let i = parseInt(document.getElementById('chonbienphuthuoc').value);
    let ketqua = ketquahoiquy['ketquahoiquy'][i-1];
    let htmlanova = `<td>${ketqua.f.toFixed(3)}</td>`;
    if (ketqua.p > 0.05) {
        htmlanova += `<td style="background: #ffe5ea; color: #d64b4b">${ketqua.p.toFixed(3)}</td>`;
    } else {
        htmlanova += `
            <td>${ketqua.p.toFixed(3)}</td>
            <td>${ketqua.r.toFixed(3)}</td>
            <td>${ketqua.r_adj.toFixed(3)}</td>
        `;
    }
    document.getElementById('bodyanova').innerHTML = htmlanova;

    let coef = ketqua.coef;
    let htmlcoef = `
        <tr>
            <th>Hằng số</th>
            <td>${parseFloat(coef[0]).toFixed(3)}</td>
            <td>${parseFloat(ketqua['coef-p'][0]).toFixed(3)}</td>
            <td></td>
        </tr>
    `;
    coef.shift();
    ketqua['coef-p'].shift();
    for (let i=0; i < coef.length; i++) {
        let rowhtml =  `
            <th>Nhân tố ${i+1}_ĐL</th>
            <td>${parseFloat(coef[i]).toFixed(3)}</td>`;
        if (ketqua['coef-p'][i] > 0.05) {
            rowhtml += `<td style="background: #ffe5ea; color: #d64b4b">${parseFloat(ketqua['coef-p'][i]).toFixed(3)}</td>`;
        } else {
            rowhtml += `<td>${parseFloat(ketqua['coef-p'][i]).toFixed(3)}</td>
                    <td>${parseFloat(ketqua['coef-ch'][i]).toFixed(3)}</td>`;
        }
        htmlcoef += `<tr>${rowhtml}</tr>`;
    }
    document.getElementById('bodyhesohoiquy').innerHTML = htmlcoef;

}

function chon_bien_phu_thuoc() {
    hienthihoiquy(ketquahoiquy);
}

function hienthibiendoclap(ketquakhacbiet) {
    let ketqua = ketquakhacbiet[0];
    let biendoclap = Object.keys(ketqua);
    let html = '';
    let i = 1;
    for (let bien of biendoclap) {
        html += `<option value='${i}'>${bien}</option>`;
        i++;
    }
    document.getElementById('chonbiendoclap').innerHTML = html;
    hienthiketquakhacbiet(ketquakhacbiet)
}

function hienthiketquakhacbiet(ketquakhacbiet) {
    let v = parseInt(document.getElementById('chonbiendoclap').value);
    let ketqua = ketquakhacbiet[0];
    let bien = ketqua[Object.keys(ketqua)[v-1]];
    let description = bien['description'];
    let htmldescription = '';
    let means = [];
    for (let i=1; i < description.length; i++) {
        means.push(description[i][1]);
        let rowdescription = `<th>${description[0][i-1]}</th>`;
        for (let k=0; k < description[i].length; k++) {
            rowdescription += `<td>${description[i][k]}</td>`;
        }
        htmldescription += `<tr>${rowdescription}</tr>`;
    }
    document.getElementById('bodythongsomota').innerHTML = htmldescription;

    let levene = bien['levene'];
    let htmllevene = `<td>${levene.s.toFixed(3)}</td><td class="p_value">${levene.p.toFixed(3)}</td>`;
    document.getElementById('bodylevene').innerHTML = htmllevene;

    let foneway = bien['f-oneway'];
    let htmlf = `<td>${foneway.f.toFixed(3)}</td><td class="p_value">${foneway.p.toFixed(3)}</td>`;
    document.getElementById('bodyanovakhacbiet').innerHTML = htmlf;

    let welch = bien['welch'];
    let htmlwelch = `<td>${welch.f.toFixed(3)}</td><td class="p_value">${welch.p.toFixed(3)}</td>`;
    document.getElementById('bodywelch').innerHTML = htmlwelch;

    let pvs = document.getElementsByClassName('p_value');
    for (pv of pvs) {
        if (parseFloat(pv.innerHTML) > 0.05) {
            pv.style.background = '#ffe5ea';
            pv.style.color = '#d64b4b';
        }
    }

    var canvas = document.getElementById('lineChart');
    if (v !== 1) {
        if (Object.keys(Chart.instances).length > 0) {
            for (key of Object.keys(Chart.instances)) {
                Chart.instances[key].destroy();
            }
        }
    }

    var lineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: description[0],
        datasets: [{
          label: Object.keys(ketqua)[v-1],
          data: means, // Các giá trị dữ liệu
          backgroundColor: 'rgba(0, 123, 255, 0.5)', // Màu nền của vùng dữ liệu
          borderColor: 'rgba(0, 123, 255, 1)', // Màu viền của vùng dữ liệu
          borderWidth: 2 // Độ rộng viền của vùng dữ liệu
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
}

function chon_bien_doc_lap() {
    hienthiketquakhacbiet(ketquakhacbiet);
}

function hienthibangthongkemota(ketquathongkemota) {
    let name = ketquathongkemota.name;
    let count = ketquathongkemota.count;
    let mean = ketquathongkemota.mean;
    let std = ketquathongkemota.std;
    let html = '';
    for (let i=0; i<name.length; i++) {
        if (mean[i] === '') {
            html += `
                <tr id=row${i} onclick="select(${i})">
                    <th>${name[i]}</th>
                    <td>${count[i]}</td>
                    <td>${mean[i]}</td>
                    <td>${std[i]}</td>
                </tr>
            `;
        } else {
            html += `
            <tr id=row${i} onclick="select(${i})">
                <th>${name[i]}</th>
                <td>${count[i]}</td>
                <td>${parseFloat(mean[i]).toFixed(3)}</td>
                <td>${parseFloat(std[i]).toFixed(3)}</td>
            </tr>
        `;
        }

    }
    document.getElementById('bodythongkemota').innerHTML = html;
    select(0);
}

function select(n) {
    let rows = document.querySelectorAll('#bodythongkemota > tr');
    for (row of rows) {
        if (row.id === `row${n}`) {
            row.classList.add('selected');
        } else {
            if (row.classList.contains('selected')) {
                row.classList.remove('selected');
            }
        }
    }
    hienfrequency();

}

function hienfrequency() {
    let row = document.getElementsByClassName('selected')[0];
    let bien = row.getElementsByTagName('th')[0].innerHTML;
    let frequency = ketquathongkemota['frequency'];
    let result = frequency[bien];
    document.getElementById('ten_bien').innerHTML = bien;
    let html = '';
    for (let i=0; i < result['Outcome'].length; i++) {
        html += `
            <tr>
                <th>${result['Outcome'][i]}</th>
                <td>${result['Count'][i]}</td>
                <td>${result['Percent'][i]}</td
            </tr>
        `;
    }
    document.getElementById('bodytanso').innerHTML = html;

    if (Object.keys(Chart.instances).length > 0) {
        for (key of Object.keys(Chart.instances)) {
            Chart.instances[key].destroy();
        }
    }
    var ctx = document.getElementById('barChart').getContext('2d');
    var barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: result['Outcome'],
            datasets: [{
                label: `Tần số của ${bien}`,
                data: result['Count'],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu nền của cột
                borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu viền của cột
                borderWidth: 1 // Độ dày viền của cột
            }]
        },
        options: {
            responsive: true, // Biểu đồ tự điều chỉnh kích thước
            scales: {
                y: {
                    beginAtZero: true // Đặt giá trị trục y bắt đầu từ 0
                }
            }
        }
    });

    var ctx = document.getElementById('pieChart').getContext('2d');
    var pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: result['Outcome'],
            datasets: [{
                label: `Phần trăm của ${bien}`,
                data: result['Percent'],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu nền của các phần
                borderColor: 'white', // Màu viền của các phần
                borderWidth: 1 // Độ dày viền của các phần
            }]
        },
        options: {
            responsive: true // Biểu đồ tự điều chỉnh kích thước
        }
    });
}

function exportHTML() {
    let options = document.querySelectorAll('#chonnhomcauhoi > option');
    let opts = [];
    for (let o of options) {
        opts.push(o.value);
    }
    let data = {'nhomcauhoi': opts};
    if (Object.keys(Chart.instances).length > 0) {
        for (key of Object.keys(Chart.instances)) {
            Chart.instances[key].destroy();
        }
    }
    sendDataChinhThuc(data);
}

function xuatKetQua(css, html) {
  var hlink, blob, url;
  blob = new Blob(['\ufeff', css + html], {
  type: 'application/msword'
  });
  url = URL.createObjectURL(blob);
  link = document.createElement('A');
  link.href = url;
  link.download = 'Document';
  document.body.appendChild(link);
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, 'Document.doc'); // IE10-11
  } else {
    link.click(); // other browsers
  }
  document.body.removeChild(link);
}

function sendDataChinhThuc(data) {
  $.ajax({
    url: '/danhgiachinhthuc',
    method: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function(response) {
      var css = (
        '<style>' +
        'table{border-collapse:collapse;}td, th{border:1px gray solid;padding:2px;}' +
        '</style>'
      );
      var htmlXuat = '';
      var cronbach = response.cronbachList;
      for (let i=0; i<cronbach.length; i++) {
          cronbachalalpha = cronbach[i].cronbach_total.toFixed(3);
          document.getElementById('crbalpha').innerHTML = cronbachalalpha;
          if (cronbachalalpha < 0.7){
            document.getElementById('crbalpha').style.backgroundColor = '#ffe5ea';
            document.getElementById('crbalpha').style.color = '#d64b4b';
          } else {
            document.getElementById('crbalpha').style.backgroundColor = 'white';
            document.getElementById('crbalpha').style.color = 'black';
          };
          document.getElementById('soluongbien').innerHTML = cronbach[i].soluongbien;
          hienthi_cronbach(cronbach[i].cronbach_table);
          htmlXuat += document.querySelector('#hienthicronbach > table').outerHTML;
          htmlXuat += document.getElementById('tableCron').outerHTML;
      }
      var efa = response.efaList;
      for (let i=0; i<efa.length; i++) {
          let ev = efa[i].ev;
          let binhphuong = efa[i].binhphuong;
          let tile = efa[i].tile;
          let tichluy = efa[i].tichluy;
          let factorNum = binhphuong.length;
          let html = '';
          for (let factor = 0; factor < factorNum - 1; factor++) {
            html += `
                <tr>
                    <th scope="row">${factor + 1}</th>
                    <td>${parseFloat(ev[factor]).toFixed(3)}</td>
                    <td>${parseFloat(binhphuong[factor]).toFixed(3)}</td>
                    <td>${parseFloat(tile[factor]).toFixed(3)}</td>
                    <td>${parseFloat(tichluy[factor]).toFixed(3)}</td>
                </tr>
            `;

          };
          factor = factorNum - 1;
          html += `
            <tr>
                <th scope="row">${factor + 1}</th>
                <td style="color: #d64b4b; background: #fff2cc;">${parseFloat(ev[factor]).toFixed(3)}</td>
                <td>${parseFloat(binhphuong[factor]).toFixed(3)}</td>
                <td>${parseFloat(tile[factor]).toFixed(3)}</td>
                <td style="color: #d64b4b; background: #fff2cc;">${parseFloat(tichluy[factor]).toFixed(3)}</td>
            </tr>
          `;
          html += `
            <tr>
                <th scope="row">${ev.length}</th>
                <td>${parseFloat(ev[ev.length - 1]).toFixed(3)}</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
          `;
          document.getElementById('bodyphuongsai').innerHTML = html;
          document.getElementById('kmo').innerHTML = parseFloat(efa[i].kmo).toFixed(3);
          document.getElementById('bartlett').innerHTML = parseFloat(efa[i].p_value).toFixed(3);
          htmlXuat += document.querySelector('#hienthiefa > table').outerHTML;
          htmlXuat += document.querySelector('#hienthiefa > div:nth-child(5) > table').outerHTML;
          if (efa[i].matran) {
            document.getElementById('matranxoay').style.display = 'block';
            hienthimatranxoay(efa[i].matran, factorNum);
            htmlXuat += document.querySelector('#matranxoay').innerHTML;
          } else {
            document.getElementById('matranxoay').style.display = 'none';
          }

      }
      htmlXuat += document.querySelector('#hienthithongkemota > div:nth-child(1)').innerHTML;
      var frequency = response.ketquathongkemota['frequency'];
      document.getElementById('mota').click();
      for (let bien in frequency) {
        let result = frequency[bien];
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', `${bien}bar`);
        canvas.style.display = 'none';
        canvas.style.width = '200px';
        var div = document.getElementById('hienthithongkemota');
        div.appendChild(canvas);
        var ctx = document.getElementById(`${bien}bar`).getContext('2d');
        var barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: result['Outcome'],
                datasets: [{
                    label: `Tần số của ${bien}`,
                    data: result['Count'],
                    backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu nền của cột
                    borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu viền của cột
                    borderWidth: 1 // Độ dày viền của cột
                }]
            },
            options: {
                responsive: true, // Biểu đồ tự điều chỉnh kích thước
                scales: {
                    y: {
                        beginAtZero: true // Đặt giá trị trục y bắt đầu từ 0
                    }
                }
            }
        });
        var canvas2 = document.createElement('canvas');
        canvas2.setAttribute('id', `${bien}pie`);
        canvas2.style.display = 'none';
        canvas2.style.width = '200px';
        var div = document.getElementById('hienthithongkemota');
        div.appendChild(canvas2);
        var ctx = document.getElementById(`${bien}pie`).getContext('2d');
        var pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: result['Outcome'],
                datasets: [{
                    label: `Phần trăm của ${bien}`,
                    data: result['Percent'],
                    backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', '#decade', '#a9e5bb', '#a2add0'], // Màu nền của các phần
                    borderColor: 'white', // Màu viền của các phần
                    borderWidth: 1 // Độ dày viền của các phần
                }]
            },
            options: {
                responsive: true // Biểu đồ tự điều chỉnh kích thước
            }
        });
      }
      setTimeout(bieudo, 1000);
      function bieudo() {
            for (let bien in frequency) {
            document.getElementById('ten_bien').innerHTML = bien;
            let result = frequency[bien];
            let html = '';
            for (let i=0; i < result['Outcome'].length; i++) {
                html += `
                    <tr>
                        <th>${result['Outcome'][i]}</th>
                        <td>${result['Count'][i]}</td>
                        <td>${result['Percent'][i]}</td
                    </tr>
                `;
            }
            document.getElementById('bodytanso').innerHTML = html;
            htmlXuat += document.querySelector('#hienthithongkemota > div:nth-child(2)').innerHTML;
            var dataURL = document.getElementById(`${bien}bar`).toDataURL();
            var image = "<img width='475' height='300' src='" + dataURL + "'/>";
            htmlXuat += image;
            dataURL = document.getElementById(`${bien}pie`).toDataURL();
            image = "<img width='300' height='300' src='" + dataURL + "'/>";
            htmlXuat += image;
          }
        xuatKetQua(css, htmlXuat);
      }

    },
    error: function(error) {
      console.log(error);
    }
  });
}