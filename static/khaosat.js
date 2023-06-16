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

       if (response.user_id) {
            localStorage.setItem('user_id', JSON.stringify(response.user_id));
       };

       if (response.name) {
            localStorage.setItem('name', JSON.stringify(response.name));
       };

       if (localStorage.getItem('detai_id')) {
            localStorage.removeItem('detai_id');
       };
       if (localStorage.getItem('nhomcauhoi_id')) {
            localStorage.removeItem('nhomcauhoi_id');
       };
      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

function hienThiLuaChonDeTai(detaiList) {
    html = '<option>Chọn đề tài...</option>';
    for (detai of detaiList) {
        option = detai['ma_de_tai'] + ' - ' + detai['ten_de_tai'];
        html += `
            <option value=${detai['detai_id']}>${option}</option>
        `;
    }
    document.getElementById('chon_detai').innerHTML = html;
}

function sendDataTaoCauHoi(data, action) {
    $.ajax({
      url: '/taocauhoi',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.nhomcauhoiList) {
            hienButtonNhomCauHoi(response.nhomcauhoiList);
        }
        if (response.detaiList) {
            for (let detai of response.detaiList) {
                if (detai['detai_id'].toString() === localStorage.getItem('detai_id').replaceAll('"','')) {
                    document.getElementById('mo_ta').value = detai['mo_ta'];
                }
            }
        }
        if (response.cauhoiList) {
            if (response.traloiDict) {
                hienCauHoi(response.cauhoiList, response.traloiDict);
            }
        }

      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

function chon_de_tai() {
    let select = document.getElementById('chon_detai');
    let option = select.options[select.selectedIndex];

    let detai_id = option.value;
    localStorage.setItem('detai_id', JSON.stringify(detai_id))
    let data = {
        'detai_id': detai_id,
        'user_id': localStorage.getItem('user_id')
    }
    sendDataTaoCauHoi(data, 'chondetai');
}

function hienButtonNhomCauHoi(nhomcauhoiList) {
    let html = '';
    for (let i=0; i<nhomcauhoiList.length; i++) {
        html += `
            <button class='btn btn-secondary mb-2' id="button${i}" style="width: 100%" onclick="hienNhomCauHoi(${i})")>
                ${nhomcauhoiList[i]['ten_nhom']}
                <span style="display: none" class="nhomcauhoi_id">${nhomcauhoiList[i]['nhomcauhoi_id']}</span>
            </button>
        `;

    }
    document.getElementById('button_nhom_cau_hoi').innerHTML = html;
    document.getElementById('button0').click();
}

function hienNhomCauHoi(n) {
// Xóa các div của button khác
    var buttons = document.querySelectorAll('#button_nhom_cau_hoi > button');
    for (let button of buttons) {
        if (button.nextElementSibling) {
            if (button.nextElementSibling.tagName === 'DIV') {
                button.nextSibling.remove();
            }
        }
        if (button.classList.contains('btn-primary')) {
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
    }
//    Đổi màu button
    let button = document.querySelector(`#button${n}`);
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');

// Thêm div hiện số câu hỏi
    let div = document.createElement('div');
    div.innerHTML = `
        <div style="margin-bottom: 8px" id="divCauHoi"></div>
    `;
    button.parentNode.insertBefore(div, button.nextSibling);

// Lấy câu hỏi
    let nhomcauhoi_id = document.querySelector(`#button${n} span`).innerHTML;
    let data = {
        'detai_id': localStorage.getItem('detai_id'),
        'nhomcauhoi_id': nhomcauhoi_id
    }
    sendDataTaoCauHoi(data, 'chonnhomcauhoi');

}

function radioCheck() {
    let radios = document.querySelectorAll('#hien_thi_cau_hoi > div');
    let buttons = document.querySelectorAll('#divCauHoi > button');
    for (let i=0; i<buttons.length; i++) {
        let inputs = radios[i].querySelectorAll('div > input:checked');
        if (inputs.length > 0) {
            buttons[i].classList.remove("btn-outline-secondary");
            buttons[i].classList.add("btn-success");
        }
    }
}

function hienCauHoi(cauhoiList, traloiDict) {
    let htmlDivCauHoi = '';
    let htmlCauHoi = '';
    for (let i=0; i<cauhoiList.length; i++) {
        htmlDivCauHoi += `
            <button class="btn btn-outline-secondary">${i+1}</button>
        `;

        htmlCauHoi += `
            <h6>${i+1}. ${cauhoiList[i]['noi_dung']}</h6>
        `;
        let traloiList = traloiDict[cauhoiList[i]['cauhoi_id']];
        let htmlTraLoi = '';
        for (traloi of traloiList) {
            htmlTraLoi += `
                <div class="form-check">
                      <input class="form-check-input" type="radio" name="${cauhoiList[i]['cauhoi_id']}" onclick="radioCheck()">
                      <label class="form-check-label">
                        ${traloi['noi_dung']}
                      </label>
                    </div>
            `;
        }
        htmlCauHoi += `<div style="margin-bottom: 8px; margin-left: 20px">${htmlTraLoi}</div>`;
    }
    document.getElementById('divCauHoi').innerHTML = htmlDivCauHoi;
    document.getElementById('hien_thi_cau_hoi').innerHTML = htmlCauHoi;
}
