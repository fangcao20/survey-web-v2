$(document).ready(function () {
//change selectboxes to selectize mode to be searchable
   $("select").select2();
});

let email = localStorage.getItem('email');
let data = {
  email: email
};
sendDataDetai(data, '');
function sendDataDetai(data, action) {
    $.ajax({
      url: '/detai',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.detaiList) {
            hienThiLuaChonDeTai(response.detaiList);
        };
      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};
var trigger = false;
function chon_de_tai() {
    if (!trigger) {
        let select = document.getElementById('chon_detai');
        let option = select.options[select.selectedIndex];

        let detai_id = option.value;
        localStorage.setItem('detai_id', JSON.stringify(detai_id))
        let data = {
            'detai_id': detai_id
        }
        sendDataKetQua(data, 'chondetai');
        document.getElementById('button_phantich').style.display = 'block';
    }
}

function hienThiLuaChonDeTai(detaiList) {
    html = '<option value="0">Chọn đề tài...</option>';
    for (detai of detaiList) {
        option = detai['ma_de_tai'] + ' - ' + detai['ten_de_tai'];
        html += `
            <option value=${detai['detai_id']}>${option}</option>
        `;
    }
    document.getElementById('chon_detai').innerHTML = html;
}

function tudetai() {
    trigger = true;
    $("#chon_detai").val("0").trigger("change");
    trigger = false;
    document.getElementById('input_detai').style.display = 'block';
    document.getElementById('input_dulieu').style.display = 'none';
    document.getElementById('headTableKetQua').innerHTML = '';
    document.getElementById('bodyTableKetQua').innerHTML = '';
    document.getElementById('button_phantich').style.display = 'none';
}

function tuteptin() {
    document.getElementById('input_dulieu').style.display = 'block';
    document.getElementById('input_detai').style.display = 'none';
    document.getElementById('hienthitenfile').innerHTML = '';
    document.getElementById('headTableFile').innerHTML = '';
    document.getElementById('bodyTableFile').innerHTML = '';
    document.getElementById('button_phantich').style.display = 'none';
}

function sendDataKetQua(data, action) {
  $.ajax({
    url: '/phantich',
    method: 'POST',
    data: JSON.stringify({ data: data, action: action }),
    contentType: 'application/json',
    success: function(response) {
      console.log(response);
      if (response.ketquas) {
        hienKetQuaDeTai(response.ketquas);
      }
      console.log("success");
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function hienKetQuaDeTai(ketquas) {
    let htmlHead = '';
    htmlHead += `
        <th>STT</th>
        <th style="min-width: 150px">Người khảo sát</th>
        <th style="min-width: 150px">Ngày khảo sát</th>
    `;
    let keys = Object.keys(ketquas[0]['tra_loi']);
    for (key of keys) {
        htmlHead += `<th>${key}</th>`
    }
    console.log(keys);
    document.getElementById('headTableKetQua').innerHTML = htmlHead;
    let htmlBody = '';
    let i = 1;
    for (let ketqua of ketquas) {
        let thongtin = ketqua['thong_tin'];
        let traloi = ketqua['tra_loi'];
        let dt = new Date(thongtin['created_at']);
        let year = dt.getFullYear();
        let month = ("0" + (dt.getMonth() + 1)).slice(-2);
        let day = ("0" + dt.getDate()).slice(-2);
        let dateStr = year + "-" + month + "-" + day;
        htmlBody += `
            <tr>
                <td>${i}</td>
                <td>${thongtin['nguoi_khao_sat']}</td>
                <td>${dateStr}</td>
        `;
        for (let key in traloi) {
            if (traloi.hasOwnProperty(key)) {
                if (typeof traloi[key] === 'string') {
                    htmlBody += `<td style="min-width: 120px">${traloi[key]}</td>`
                } else {
                    htmlBody += `<td style="min-width: 40px">${traloi[key]}</td>`;
                }
            }
        }
        htmlBody += '</tr>'
        i++;
    }
    document.getElementById('bodyTableKetQua').innerHTML = htmlBody;
}

function xulyfile() {
    const file = document.getElementById("fileinput").files[0];
    document.getElementById("hienthitenfile").innerHTML = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(jsonData);
        sendDataKetQua(jsonData, 'file');
        let header = jsonData[0];
        let htmlHead = '<th>STT</th>';
        for (col of header) {
            htmlHead += `
                <th>${col}</th>
            `;
        }
        document.getElementById('headTableFile').innerHTML = htmlHead;
        let htmlBody = '';
        for (let i=1; i<jsonData.length; i++) {
            htmlBody += `<tr>
                            <th scope="row">${i}</th>`;
            for (let col of jsonData[i]) {
                htmlBody += `<td>${col}</td>`;
            }
            htmlBody += '</tr>';
        }
        document.getElementById('bodyTableFile').innerHTML = htmlBody;
        document.getElementById('button_phantich').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
};

