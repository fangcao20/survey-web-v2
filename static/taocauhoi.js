$(document).ready(function () {
//change selectboxes to selectize mode to be searchable
   $("#chon_nhomcauhoi").select2();
   $("#chon_detai").select2();
});

let email = localStorage.getItem('email');
let data = {
  email: email
};
if (localStorage.getItem('cauhoi_id')) {
    localStorage.removeItem('cauhoi_id');
}
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

function sendDataTaoCauHoi(data, action) {
    $.ajax({
      url: '/taocauhoi',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.nhomcauhoiList) {
            hienNhomCauHoi(response.nhomcauhoiList);
            hienBangNhomCauHoi(response.nhomcauhoiList);
        }
        if (response.cauhoiList) {
            hienCauHoi(response.cauhoiList);
        }
        if (response.traloiList) {
            hienTraLoi(response.traloiList);
        }

      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

function open_taonhom() {
    if (localStorage.getItem('nhomcauhoi_id')) {
        localStorage.removeItem('nhomcauhoi_id');
    }
}

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

function chon_de_tai() {
    let select = document.getElementById('chon_detai');
    let option = select.options[select.selectedIndex];

    let detai_id = option.value;
    localStorage.setItem('detai_id', JSON.stringify(detai_id))
    let data = {
        'detai_id': detai_id
    }
    sendDataTaoCauHoi(data, 'chondetai');
    huy_cau_hoi();
    document.getElementById('ma_cau_hoi').value = '';
    if (document.getElementById('chon_loaicautraloi').value == 'Thang đo Likert') {
        let rows = [];
        hienInputLikert(rows);
    }
}

function hienNhomCauHoi(nhomcauhoiList) {
    html = '<option value="Chọn">Chọn nhóm câu hỏi...</option>'
    for (nhomcauhoi of nhomcauhoiList) {
        option = nhomcauhoi['ma_nhom'] + ' - ' + nhomcauhoi['ten_nhom']
        html += `<option value=${nhomcauhoi['nhomcauhoi_id']}>${option}</option>`;
    }
    document.getElementById('chon_nhomcauhoi').innerHTML = html;
}

function hienBangNhomCauHoi(nhomcauhoiList) {
    let html = '';
    let i = 0;
    for (nhomcauhoi of nhomcauhoiList) {
        i++;
        html += `
            <tr>
                <td>${i}</td>
                <td><input type="checkbox"></td>
                <td>${nhomcauhoi['ma_nhom']}</td>
                <td>${nhomcauhoi['ten_nhom']}</td>
                <td style="display: none">${nhomcauhoi['nhomcauhoi_id']}</td>
            </tr>
        `;
    }
    document.getElementById('bodyTableNhomCauHoi').innerHTML = html;
};

function luu_nhom_cau_hoi() {
    let ten_nhom = document.getElementById('ten_nhom').value;
    let ma_nhom = document.getElementById('ma_nhom').value;

    let nhomcauhoi = {
      'ten_nhom': ten_nhom,
      'ma_nhom': ma_nhom,
    };

    if (localStorage.getItem('detai_id')) {
        nhomcauhoi['detai_id'] = localStorage.getItem('detai_id');
    };

    if (localStorage.getItem('nhomcauhoi_id')) {
        nhomcauhoi['nhomcauhoi_id'] = localStorage.getItem('nhomcauhoi_id');
        localStorage.removeItem('nhomcauhoi_id');
    };

    if (!nhomcauhoi['detai_id']) {
        alert("Vui lòng chọn đề tài trước!");
    } else {
        sendDataTaoCauHoi(nhomcauhoi, 'lưu nhóm câu hỏi');

        huy_nhom_cau_hoi();
        alert("Lưu nhóm câu hỏi thành công!");
    }
};

function chon_nhom_cau_hoi() {
    let table = document.getElementById('tableNhomCauHoi');
    let checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn 1 nhóm câu hỏi.");
    } else if (checkboxes.length > 1) {
        alert("Vui lòng chỉ chọn 1 nhóm câu hỏi.");
    } else {
        let selectedRow = {};

        checkboxes.forEach(function(checkbox) {
          let row = checkbox.closest('tr');
          let cells = row.cells;
          selectedRow['ma_nhom'] = cells[2].innerText;
          selectedRow['ten_nhom'] = cells[3].innerText;
          selectedRow['nhomcauhoi_id'] = cells[4].innerText;
        });

        if (localStorage.getItem('detai_id')) {
            selectedRow['detai_id'] = localStorage.getItem('detai_id');
        };

        return selectedRow;
    }
};

function sua_nhom_cau_hoi() {
    selectedRow = chon_nhom_cau_hoi();
    document.getElementById('ten_nhom').value = selectedRow['ten_nhom'];
    document.getElementById('ma_nhom').value = selectedRow['ma_nhom'];
    localStorage.setItem('nhomcauhoi_id', JSON.stringify(parseInt(selectedRow['nhomcauhoi_id'])));
};

function xoa_nhom_cau_hoi() {
    selectedRow = chon_nhom_cau_hoi();
    sendDataTaoCauHoi(selectedRow, 'xóa nhóm câu hỏi');
    alert("Xóa nhóm câu hỏi thành công!");
}

function huy_nhom_cau_hoi() {
    document.getElementById('ten_nhom').value = '';
    document.getElementById('ma_nhom').value = '';
}

var trigger = false;
function chon_nhom_cau_hoi_select() {
    let select = document.getElementById('chon_nhomcauhoi');
    let option = select.options[select.selectedIndex];

    let nhomcauhoi_id = option.value;
    localStorage.setItem('nhomcauhoi_id', JSON.stringify(nhomcauhoi_id));
    let data = {
        'nhomcauhoi_id': nhomcauhoi_id
    }
    if (localStorage.getItem('detai_id')) {
        data['detai_id'] = localStorage.getItem('detai_id');
    };
    if (!trigger) {
        sendDataTaoCauHoi(data, 'chonnhomcauhoi');
        document.getElementById('ma_cau_hoi').value = option.text.split(' - ')[0];
    }
}

function hienCauHoi(cauhoiList) {
    const numCauHoi = cauhoiList.length;
    let html = '';
    for (let i = 0; i < numCauHoi; i++) {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td><input type="radio" name="cauhoi"></td>
                <td>${cauhoiList[i]['ma_cau_hoi']}</td>
                <td>${cauhoiList[i]['noi_dung']}</td>
                <td>${cauhoiList[i]['trang_thai']}</td>
                <td style="display: none">${cauhoiList[i]['cauhoi_id']}</td>
                <td style="display: none">${cauhoiList[i]['loaicautraloi_id']}</td>
                <td style="display: none">${cauhoiList[i]['nhomcauhoi_id']}</td>
            </tr>
        `;
    }
    document.getElementById('bodyTableCauHoi').innerHTML = html;
}

function them_cau_tra_loi() {
    let luachonDiv = document.getElementById('luachon');
    let textareas = luachonDiv.querySelectorAll('textarea');
    hienInputLuaChon(textareas);
}

function xoa_cau_tra_loi(n) {;
    let luachonDiv = document.getElementById('luachon');
    let textareas = luachonDiv.querySelectorAll('textarea');
    textareas[n-1].closest('div').remove();
    textareas[textareas.length - 1].closest('div').remove();
    textareas = luachonDiv.querySelectorAll('textarea');
    hienInputLuaChon(textareas);
}

function hienInputLuaChon(textareas) {
    let html = '';
    let i = 1;
    let luachonList = [];
    if (textareas.length >= 1) {
        for (textarea of textareas) {
            luachonList.push(textarea.value);
            html += `
                <div class="input-group mb-1">
                    <span style="margin-right: 5px; margin-top: 6px">${i}.</span>
                    <textarea class="form-control" style="height: 24px;">${textarea.value}</textarea>
                    <button class="btn btn-danger" style="width: 40px" type="button" onclick="xoa_cau_tra_loi(${i})">-</button>
                </div>
            `;
            i++;
        }
    }
    html += `
        <div class="input-group">
            <span style="margin-right: 5px; visibility: hidden">1.</span>
            <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung câu trả lời"></textarea>
            <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_cau_tra_loi()">+</button>
          </div>
    `;
    document.getElementById('luachon').innerHTML = html;
    return luachonList
}

function chon_loai_cau_traloi() {
    let loai_cau_tra_loi = document.getElementById('chon_loaicautraloi').value;
    let luachonDiv = document.getElementById('luachon');
    if (loai_cau_tra_loi === "Thang đo Likert") {
        luachonDiv.previousElementSibling .style.display = 'none';
        html = `
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 120px">Điểm Likert</th>
                        <th>Nội dung</th>
                    </tr>
                </thead>
                <tbody id="bodyInputLikert">
                    <tr>
                        <td style="width: 120px">
                            <input type="text" class="form-control"></td>
                        <td>
                            <div class="input-group">
                            <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung"></textarea>
                            <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_lua_chon_likert()">+</button>
                          </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        luachonDiv.innerHTML = html;
    }
    if (loai_cau_tra_loi === "Trắc nghiệm") {
        luachonDiv.previousElementSibling .style.display = 'block';
        html = `
            <div class="input-group">
                <span style="margin-right: 5px; visibility: hidden">1.</span>
                <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung câu trả lời"></textarea>
                <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_cau_tra_loi()">+</button>
              </div>
        `;
        luachonDiv.innerHTML = html;
    }
}

function them_lua_chon_likert() {
    let table = document.querySelector('#luachon > table');
    let rows = table.rows;
    hienInputLikert(rows);
}

function xoa_lua_chon_likert(n) {;
    let table = document.querySelector('#luachon > table');
    let rows = table.rows;
    rows[n].remove();
    rows[rows.length - 1].remove();
    table = document.querySelector('#luachon > table');
    rows = table.rows;
    hienInputLikert(rows);
}

function hienInputLikert(rows) {
    let html = '';
    let likertList = [];
    for (let i=1; i < rows.length; i++) {
        let input = rows[i].querySelector('input').value;
        let textarea = rows[i].querySelector('textarea').value;
        let likertDict = {
            'diem_likert': input,
            'noi_dung': textarea
        };
        likertList.push(likertDict);
        html += `
            <tr>
                <td style="width: 120px">
                    <input type="text" class="form-control" value="${input}"></td>
                <td>
                    <div class="input-group">
                    <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung">${textarea}</textarea>
                    <button class="btn btn-danger" style="width: 40px" type="button" onclick="xoa_lua_chon_likert(${i})">-</button>
                  </div>
                </td>
            </tr>
        `;
    }
    html += `
        <tr>
            <td style="width: 120px">
                <input type="text" class="form-control" id="diem_likert"></td>
            <td>
                <div class="input-group">
                <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung"></textarea>
                <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_lua_chon_likert()">+</button>
              </div>
            </td>
        </tr>
    `;
    document.getElementById('bodyInputLikert').innerHTML = html;
    return likertList;
}

function luu_cau_hoi() {
    let ma_cau_hoi = document.getElementById('ma_cau_hoi').value;
    let noi_dung = document.getElementById('noidung_cauhoi').value;
    let loai_cau_tra_loi = document.getElementById('chon_loaicautraloi').value;

    let traloiList = lay_cau_tra_loi(loai_cau_tra_loi)['tra_loi'];
    let loaicautraloi_id = lay_cau_tra_loi(loai_cau_tra_loi)['loaicautraloi_id'];

    let cauhoi = {
      'ma_cau_hoi': ma_cau_hoi,
      'noi_dung': noi_dung,
      'loaicautraloi_id': loaicautraloi_id,
      'trang_thai': 'Hiện',
      'tra_loi': traloiList
    };

    if (localStorage.getItem('detai_id')) {
        cauhoi['detai_id'] = localStorage.getItem('detai_id');
    };

    if (localStorage.getItem('nhomcauhoi_id')) {
        cauhoi['nhomcauhoi_id'] = localStorage.getItem('nhomcauhoi_id');
    };

    if (localStorage.getItem('cauhoi_id')) {
        cauhoi['cauhoi_id'] = localStorage.getItem('cauhoi_id');
        localStorage.removeItem('cauhoi_id');
    };
    console.log(cauhoi['cauhoi_id']);
    console.log(localStorage.getItem('cauhoi_id'));

    if (!cauhoi['detai_id']) {
        alert("Vui lòng chọn đề tài trước!");
    } else if (!cauhoi['nhomcauhoi_id']) {
        alert("Vui lòng chọn nhóm câu hỏi trước!");
    } else {
        console.log(cauhoi);
        sendDataTaoCauHoi(cauhoi, 'lưu câu hỏi');

        huy_cau_hoi();
        alert("Lưu câu hỏi thành công!");
    }
};

function chon_cau_hoi() {
    let table = document.getElementById('tableCauHoi');
    let checkboxes = table.querySelectorAll('input[type="radio"]:checked');
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn 1 câu hỏi.");
    } else if (checkboxes.length > 1) {
        alert("Vui lòng chỉ chọn 1 câu hỏi.");
    } else {
        let selectedRow = {};

        checkboxes.forEach(function(checkbox) {
          let row = checkbox.closest('tr');
          let cells = row.cells;
          selectedRow['ma_cau_hoi'] = cells[2].innerText;
          selectedRow['noi_dung'] = cells[3].innerText;
          selectedRow['trang_thai'] = cells[4].innerText;
          selectedRow['cauhoi_id'] = cells[5].innerText;
          selectedRow['loaicautraloi_id'] = cells[6].innerText;
          selectedRow['nhomcauhoi_id'] = cells[7].innerText;
        });

        if (localStorage.getItem('detai_id')) {
            selectedRow['detai_id'] = localStorage.getItem('detai_id');
        };

        return selectedRow;
    }
};

function sua_cau_hoi() {
    selectedRow = chon_cau_hoi();
    document.getElementById('ma_cau_hoi').value = selectedRow['ma_cau_hoi'];
    document.getElementById('noidung_cauhoi').value = selectedRow['noi_dung'];
    document.getElementById('ma_cau_hoi').value = selectedRow['ma_cau_hoi'];
    localStorage.setItem('cauhoi_id', JSON.stringify(parseInt(selectedRow['cauhoi_id'])));
    let data = {
        'cauhoi_id': selectedRow['cauhoi_id'],
        'loaicautraloi_id': selectedRow['loaicautraloi_id'],
    };
    trigger = true;
    $("#chon_nhomcauhoi").val(selectedRow['nhomcauhoi_id']).trigger("change");
    trigger = false;

    sendDataTaoCauHoi(data, "lấy câu trả lời");
};

function hienTraLoi(traloiList) {
    if ('diem_likert' in traloiList[0]) {
        document.getElementById('chon_loaicautraloi').value = "Thang đo Likert";
        chon_loai_cau_traloi()
        let html = '';
        let i = 1;
        for (traloi of traloiList) {
            html += `
                <tr>
                    <td style="width: 120px">
                        <input type="text" class="form-control" value="${traloi['diem_likert']}"></td>
                    <td>
                        <div class="input-group">
                        <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung">${traloi['noi_dung']}</textarea>
                        <button class="btn btn-danger" style="width: 40px" type="button" onclick="xoa_lua_chon_likert(${i})">-</button>
                      </div>
                    </td>
                </tr>
            `;
            i++;
        }
        html += `
            <tr>
                <td style="width: 120px">
                    <input type="text" class="form-control" id="diem_likert"></td>
                <td>
                    <div class="input-group">
                    <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung"></textarea>
                    <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_lua_chon_likert()">+</button>
                  </div>
                </td>
            </tr>
        `;
        document.getElementById('bodyInputLikert').innerHTML = html;
    } else {
        document.getElementById('chon_loaicautraloi').value = "Trắc nghiệm";
        chon_loai_cau_traloi();
        let html = '';
        let i = 1;
        let luachonList = [];
        if (traloiList.length >= 1) {
            for (textarea of traloiList) {
                luachonList.push(textarea.value);
                html += `
                    <div class="input-group mb-1">
                        <span style="margin-right: 5px; margin-top: 6px">${i}.</span>
                        <textarea class="form-control" style="height: 24px;">${textarea['noi_dung']}</textarea>
                        <button class="btn btn-danger" style="width: 40px" type="button" onclick="xoa_cau_tra_loi(${i})">-</button>
                    </div>
                `;
                i++;
            }
        }
        html += `
            <div class="input-group">
                <span style="margin-right: 5px; visibility: hidden">1.</span>
                <textarea class="form-control" style="height: 24px;" placeholder="Nhập nội dung câu trả lời"></textarea>
                <button class="btn btn-primary" style="width: 40px" type="button" onclick="them_cau_tra_loi()">+</button>
              </div>
        `;
        document.getElementById('luachon').innerHTML = html;
    }
}

function xoa_cau_hoi() {
    selectedRow = chon_cau_hoi();
    sendDataTaoCauHoi(selectedRow, 'xóa câu hỏi');
    alert("Xóa câu hỏi thành công!");
}

function lay_cau_tra_loi(loai_cau_tra_loi) {
    if (loai_cau_tra_loi === "Trắc nghiệm") {
        var loaicautraloi_id = 1;
        var luachonDiv = document.getElementById('luachon');
        var textareas = luachonDiv.querySelectorAll('textarea');
        textareas[textareas.length-1].remove();
        textareas = luachonDiv.querySelectorAll('textarea');
        var traloiList = hienInputLuaChon(textareas);
    } else {
        var loaicautraloi_id = 2;
        var table = document.querySelector('#luachon > table');
        var rows = table.rows;
        rows[rows.length-1].remove();
        rows = document.querySelector('#luachon > table').rows;
        var traloiList = hienInputLikert(rows);
    }
    return {'tra_loi': traloiList, 'loaicautraloi_id': loaicautraloi_id}
}

function huy_cau_hoi() {
    document.getElementById('ma_cau_hoi').value = '';
    document.getElementById('noidung_cauhoi').value = '';
    let selectedOptionText = $("#chon_nhomcauhoi option:selected").text();
    document.getElementById('ma_cau_hoi').value = selectedOptionText.split(' - ')[0];
    if (localStorage.getItem('cauhoi_id')) {
        localStorage.removeItem('cauhoi_id');
    }
    let checkeds = document.querySelectorAll('#bodyTableCauHoi > tr > td > input[type=radio]')
    for (checked of checkeds) {
        checked.checked = false;
    }
    if (document.getElementById('chon_loaicautraloi').value == 'Trắc nghiệm') {
        let textareas = [];
        hienInputLuaChon(textareas);
    }
}