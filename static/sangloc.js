var detai_id = localStorage.getItem('detai_id').replaceAll('"', '');
var detai = {'detai_id':detai_id};
sendDataTaoCauHoi(detai, 'chondetai')
function sendDataTaoCauHoi(data, action) {
    $.ajax({
      url: '/taocauhoi',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.cauhoiList) {
            console.log(response);
            hienCauHoi(response.cauhoiList);
        }

      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

function sendDataSangLoc(data, action) {
    $.ajax({
      url: '/sangloccauhoi',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.cauhoiList) {
            console.log(response);
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
                    <tr id="${cauhoi['cauhoi_id']}">
                        <td style="color: #d64b4b; background: #fff2cc;">${ixoa}</td>
                        <td style="color: #d64b4b; background: #fff2cc;"><input type="checkbox"></td>
                        <td style="color: #d64b4b; background: #fff2cc;">${cauhoi['ma_cau_hoi']}</td>
                        <td style="color: #d64b4b; background: #fff2cc;">${cauhoi['noi_dung']}</td>
                        <td style="color: #d64b4b; background: #fff2cc;">${cauhoi['trang_thai']}</td>
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
                    <td><input type="checkbox"></td>
                    <td>${cauhoi['ma_cau_hoi']}</td>
                    <td>${cauhoi['noi_dung']}</td>
                    <td>${cauhoi['trang_thai']}</td>
                </tr>
            `;
            ikhaosat++;
        }
    }
    document.getElementById('bodyCauHoiTamXoa').innerHTML = htmlXoa;
    document.getElementById('bodyCauHoiKhaoSat').innerHTML = htmlKhaoSat;
    console.log(htmlKhaoSat);
}

function chonCauHoi() {
    let checked = document.querySelector('input[type=checkbox]:checked');
    let tr = checked.parentNode.parentNode;
    let cauhoi_id = tr.id;
    return cauhoi_id;
}

function sua_cau_hoi() {
    let cauhoi_id = chonCauHoi();
    let tr = document.getElementById(cauhoi_id);
    let tds = tr.getElementsByTagName('td');
    let noi_dung = tds[3].innerHTML;
    document.getElementById('suaCauHoi').value = noi_dung;
    document.getElementById('divSuaCauHoi').style.display = "block";
}

function an_cau_hoi() {
    let cauhoi_id = chonCauHoi();
    let tr = document.getElementById(cauhoi_id);
    let tds = tr.getElementsByTagName('td');
    let ma_cau_hoi = tds[2].innerHTML;
    if (bienXoa.includes(ma_cau_hoi)) {
        let index = bienXoa.indexOf(ma_cau_hoi);
        bienXoa.splice(index, 1);
        localStorage.setItem('bien_xoa', JSON.stringify(bienXoa));
    }
    let data = {'cauhoi_id': cauhoi_id, 'detai_id': detai_id};
    sendDataSangLoc(data, 'ancauhoi');
}

function hien_cau_hoi() {
    let cauhoi_id = chonCauHoi();
    let tr = document.getElementById(cauhoi_id);
    let tds = tr.getElementsByTagName('td');
    let ma_cau_hoi = tds[2].innerHTML;
    if (bienXoa.includes(ma_cau_hoi)) {
        let index = bienXoa.indexOf(ma_cau_hoi);
        bienXoa.splice(index, 1);
        localStorage.setItem('bien_xoa', JSON.stringify(bienXoa));
    }
    let data = {'cauhoi_id': cauhoi_id, 'detai_id': detai_id};
    sendDataSangLoc(data, 'hiencauhoi');
}