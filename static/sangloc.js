var detai_id = localStorage.getItem('detai_id').replaceAll('"', '');
var detai = {'detai_id':detai_id};
sendDataSangLoc(detai, 'chondetai')

function sendDataSangLoc(data, action) {
    $.ajax({
      url: '/sangloccauhoi',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.cauhoiList) {
            if (response.cauhoiList[0]['detai_id'].toString() !== detai_id) {
                localStorage.setItem('detai_id', JSON.stringify(response.cauhoiList[0]['detai_id']));
            }
            hienCauHoi(response.cauhoiList);
        }

      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

var bienXoa = [];
if (localStorage.getItem('bien_xoa')) {
    bienXoa = JSON.parse(localStorage.getItem('bien_xoa'));
};

function hienCauHoi(cauhoiList) {
    var bienXoa = [];
    if (localStorage.getItem('bien_xoa')) {
        bienXoa = JSON.parse(localStorage.getItem('bien_xoa'));
    };
    console.log(bienXoa);
    let htmlXoa = '';
    let htmlKhaoSat = '';
    let ixoa = 1;
    let ikhaosat = 1;
    for (cauhoi of cauhoiList) {
        let xoa = false;
        for (bien of bienXoa) {
            if (bien === cauhoi['ma_cau_hoi']) {
                htmlXoa += `
                    <tr id="${cauhoi['cauhoi_id']}" class="delete" onclick="chonCauHoi(${cauhoi['cauhoi_id']})">
                        <td>${ixoa}</td>
                        <td>${cauhoi['ma_cau_hoi']}</td>
                        <td>${cauhoi['noi_dung']}</td>
                    </tr>
                `;
                xoa = true;
                ixoa++;
            }
        }
        if (!xoa) {
            htmlKhaoSat += `
                <tr id="${cauhoi['cauhoi_id']}">
                    <td>${ikhaosat}</td>
                    <td>${cauhoi['ma_cau_hoi']}</td>
                    <td>${cauhoi['noi_dung']}</td>
                </tr>
            `;
            ikhaosat++;
        }
    }
    document.getElementById('bodyCauHoiTamXoa').innerHTML = htmlXoa;
    document.getElementById('bodyCauHoiKhaoSat').innerHTML = htmlKhaoSat;
    let rows = document.querySelectorAll('#bodyCauHoiTamXoa > tr');
    let exist = [];
    for (row of rows) {
        let cells = row.getElementsByTagName('td');
        let ma_cau_hoi = cells[1].innerHTML;
        exist.push(ma_cau_hoi)
    }
    let differentElements = bienXoa.filter(element => !exist.includes(element));
    if (differentElements.length > 0) {
        document.getElementById('thongbao').innerHTML = '*' + differentElements.join(', ') + ' đã bị xóa.';
    }
}

function chonCauHoi(n) {
    let rows = document.querySelectorAll('#bodyCauHoiTamXoa > tr');
    for (row of rows) {
        if (row.id === `${n}`) {
            row.classList.add('selected');
        } else {
            if (row.classList.contains('selected')) {
                row.classList.remove('selected');
            }
        }
    }
}

function sua_cau_hoi() {
    let row = document.getElementsByClassName('selected')[0];
    let tds = row.getElementsByTagName('td');
    let noi_dung = tds[2].innerHTML;
    document.getElementById('suaCauHoi').value = noi_dung;
    document.getElementById('divSuaCauHoi').style.display = "block";
}

function xoa_cau_hoi() {
    let row = document.getElementsByClassName('selected')[0];
    let cauhoi_id = row.id;
    let tds = row.getElementsByTagName('td');
    let ma_cau_hoi = tds[2].innerHTML;
    if (bienXoa.includes(ma_cau_hoi)) {
        let index = bienXoa.indexOf(ma_cau_hoi);
        bienXoa.splice(index, 1);
        localStorage.setItem('bien_xoa', JSON.stringify(bienXoa));
    }
    let data = {'cauhoi_id': cauhoi_id, 'detai_id': detai_id};
    sendDataSangLoc(data, 'xoacauhoi');
    row.remove();
}

function giu_cau_hoi() {
    let row = document.querySelector('#bodyCauHoiTamXoa > .selected');
    let cauhoi_id = row.id;
    let tds = row.getElementsByTagName('td');
    let ma_cau_hoi = tds[1].innerHTML;
    let noi_dung = tds[2].innerHTML;
    if (bienXoa.includes(ma_cau_hoi)) {
        let index = bienXoa.indexOf(ma_cau_hoi);
        bienXoa.splice(index, 1);
        localStorage.setItem('bien_xoa', JSON.stringify(bienXoa));
    }
    let data = {'cauhoi_id': cauhoi_id, 'detai_id': detai_id, 'noi_dung': noi_dung};
    sendDataSangLoc(data, 'luucauhoi');
    row.remove();
    let table = document.getElementById('bodyCauHoiKhaoSat');
    let numRow = table.rows.length;
    row.cells[0].innerHTML = (numRow + 1).toString();
    row.classList.remove('delete');
    document.getElementById('bodyCauHoiKhaoSat').appendChild(row);
}

function luu_cau_hoi() {
    let row = document.getElementsByClassName('selected')[0];
    let cauhoi_id = row.id;
    let noi_dung = document.getElementById('suaCauHoi').value;
    let cells = row.cells;
    cells[2].innerHTML = noi_dung;
    row.classList.add('changed');
    row.classList.remove('delete');
    document.getElementById('divSuaCauHoi').style.display = 'none';
}