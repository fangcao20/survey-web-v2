document.getElementById('ten_de_tai').innerHTML = detai['ten_de_tai'];
document.getElementById('mo_ta_de_tai').innerHTML = detai['mo_ta'];
sendData('','');
sendData(detai, 'chondetai');
var checkedDict = {};
function sendData(data, action) {
    $.ajax({
      url: '/phieukhaosat',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        console.log(response);
        if (response.nhomcauhoiList) {
            hienButtonNhomCauHoi(response.nhomcauhoiList);
        }
        if (response.cauhoiList) {
            if (response.traloiDict) {
                hienCauHoi(response.cauhoiList, response.traloiDict);
                // Check hết 1 lượt nếu có
                for (let key in checkedDict) {
                    if (checkedDict.hasOwnProperty(key)) {
                        let cauhoi_id = key;
                        let index = checkedDict[key];
                        hienChecked(cauhoi_id, index);
                    }
                }
            }
        }

      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

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
        <div id="divCauHoi"></div>
    `;
    button.parentNode.insertBefore(div, button.nextSibling);

// Lấy câu hỏi
    let nhomcauhoi_id = document.querySelector(`#button${n} span`).innerHTML;
    let data = {
        'detai_id': localStorage.getItem('detai_id'),
        'nhomcauhoi_id': nhomcauhoi_id
    }
    sendData(data, 'chonnhomcauhoi');


}

function radioCheck() {
    let radios = document.querySelectorAll('#hien_thi_cau_hoi > div');
    let buttons = document.querySelectorAll('#divCauHoi > button');
    let checked = 0;
    let cauhoi_id;


    for (let k=0; k<buttons.length; k++) {
        let inputs = radios[k].querySelectorAll('div > input');
        for (let i=0; i<inputs.length; i++) {
            if (inputs[i].checked === true) {
                buttons[k].classList.remove("btn-outline-secondary");
                buttons[k].classList.add("btn-success");
                checked++;
                cauhoi_id = inputs[0].name;
                checkedDict[cauhoi_id] = i;
            }
        }
    }

    if (checked === buttons.length) {
        var buttonNhom = buttons[0].parentNode.parentNode.previousElementSibling;
        buttonNhom.classList.remove('btn-primary');
        buttonNhom.classList.add('btn-success');
    }

    let done = true;
    let btns = document.querySelectorAll('#button_nhom_cau_hoi > button');
    for (let btn of btns) {
        if (btn.classList.contains('btn-secondary')) {
            done = false;
            break;
        }
    }
    if (done) {
        document.getElementById('button_gui').style.display = 'block';
    }
}

// Hiện các câu đã checked khi di chuyển qua mỗi nhóm câu hỏi
function hienChecked(cauhoi_id, index) {
    let radios = document.querySelectorAll('#hien_thi_cau_hoi > div');
    for (let k=0; k<radios.length; k++) {
        let inputs = radios[k].querySelectorAll('div > input');
        if (inputs[0].name === cauhoi_id.toString()) {
            for (let i=0; i<inputs.length; i++) {
                if (i === index) {
                    inputs[i].checked = true;
                    break;
                }
            }
            radioCheck();
            break;
        }
    }
}

function hienCauHoi(cauhoiList, traloiDict) {
    let htmlDivCauHoi = '';
    let htmlCauHoi = '';
    for (let i=0; i<cauhoiList.length; i++) {
        htmlDivCauHoi += `
            <button class="btn btn-outline-secondary mb-2">${i+1}</button>
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

function gui_phieu_khao_sat() {
    if (document.getElementById('nguoi_khao_sat').value === '') {
        alert("Vui lòng điền người khảo sát!");
    } else if (document.getElementById('ngay_khao_sat').value === '') {
        alert("Vui lòng điền ngày khảo sát");
    } else {
        let data = {};
        data['checkedDict'] = checkedDict;
        data['detai_id'] = detai['detai_id'];

        let thong_tin = {};
        thong_tin['ngay_khao_sat'] = document.getElementById('ngay_khao_sat').value;
        thong_tin['nguoi_khao_sat'] = document.getElementById('nguoi_khao_sat').value;

        data['thong_tin'] = thong_tin;

        sendData(data, 'kết quả');
        alert("Gửi thành công. Cảm ơn!");

        document.getElementById('ngay_khao_sat').value = '';
        document.getElementById('nguoi_khao_sat').value = '';
        let radios = document.querySelectorAll('input[type=radio]');
        for (radio of radios) {
            radio.checked = false;
        }
    }
}