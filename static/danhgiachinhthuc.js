$(document).ready(function () {
//change selectboxes to selectize mode to be searchable
   $("select").select2();
});
sendData()
let data = {
    'nhomcauhoi': ''
}
sendDataSoBo(data, 'nhomcauhoi');
var bienXoa = [];
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
      console.log(response);
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
            <td></td>
        </tr>
      `;
      document.getElementById('bodyphuongsai').innerHTML = html;
      document.getElementById('kmo').innerHTML = parseFloat(response.kmo).toFixed(3);
      document.getElementById('bartlett').innerHTML = parseFloat(response.p_value).toFixed(3);
      hienthimatranxoay(response.matran, factorNum);
      console.log("success");
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
    htmlHead += '<th>Tạm xóa</th></tr>';
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
        if (parseFloat(table[i][3]) < 0.3) {
            row += `<td style="background: #ffe5ea"><button class="btn btn-danger" onclick=tam_xoa(${i})>x</button></td>`;
        } else {
            row += `<td><button class="btn btn-danger" onclick=tam_xoa(${i})>x</button></td>`;
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

function nhantokhampha(){
    let link = document.getElementById('efa');
    link.classList.add('active');
    link.setAttribute("aria-current", "page");
    link = document.getElementById('cronbachalpha');
    if (link.classList.contains('active')) {
        link.classList.remove('active');
        link.removeAttribute("aria-current");
    }
    document.getElementById('hienthicronbach').style.display = 'none';
    document.getElementById('hienthiefa').style.display = 'block';
};

function cronbach(){
    let link = document.getElementById('cronbachalpha');
    link.classList.add('active');
    link.setAttribute("aria-current", "page");
    link = document.getElementById('efa');
    if (link.classList.contains('active')) {
        link.classList.remove('active');
        link.removeAttribute("aria-current");
    };
    document.getElementById('hienthicronbach').style.display = 'block';
    document.getElementById('hienthiefa').style.display = 'none';
};

function hienthimatranxoay(matran, factorNum){
    let numRow = Object.keys(matran).length;
    let head = '<th style="position: sticky; top: 0; background: white"></th>';
    for (let factor = 1; factor <= factorNum; factor++){
        head += `<th style="position: sticky; top: 0; background: white">Nhân tố ${factor}</th>`
    };
    document.getElementById('headmatranxoay').innerHTML = head;

    let body = '';
    let rowhtml = '';
    for (let row = 1; row <= numRow; row++){
        rowhtml = `<th scope="row">${matran[row][0]}</th>`;
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