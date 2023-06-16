let email = localStorage.getItem('email');
let data = {
  email: email
};
sendDataDetai(data, '');

function hienThiDeTai(data) {
    let html = '';
    let i = 0;
    for (detai of data) {
        var dateString = detai['ngay_thuc_hien'];
        var dateObject = new Date(dateString);
        var month = dateObject.getUTCMonth() + 1; // Tháng bắt đầu từ 0, nên cần cộng thêm 1
        var day = dateObject.getUTCDate();
        var year = dateObject.getUTCFullYear();
        var formattedDate = year.toString() + '-' + month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');
        var mo_ta = detai['mo_ta'];
        if (mo_ta === null) {
            mo_ta = '';
        };

        html += `
            <tr>
                <td>${i + 1}</td>
                <td><input type="checkbox"></td>
                <td>${detai['ma_de_tai']}</td>
                <td>${detai['ten_de_tai']}</td>
                <td>${detai['nguoi_thuc_hien']}</td>
                <td>${formattedDate}</td>
                <td>${mo_ta}</td>
                <td style="display: none">${detai['detai_id']}</td>
            </tr>
        `;
        i++;
    };
    document.getElementById('bodyTableDeTai').innerHTML = html;
};

function luu_de_tai() {
    let ten_de_tai = document.getElementById('ten_de_tai').value;
    let ma_de_tai = document.getElementById('ma_de_tai').value;
    let nguoi_thuc_hien = document.getElementById('nguoi_thuc_hien').value;
    let ngay_thuc_hien = document.getElementById('ngay_thuc_hien').value;
    let mo_ta = document.getElementById('mo_ta').value;

    let detai = {
      'ma_de_tai': ma_de_tai,
      'ten_de_tai': ten_de_tai,
      'nguoi_thuc_hien': nguoi_thuc_hien,
      'ngay_thuc_hien': ngay_thuc_hien,
      'mo_ta': mo_ta
    };

    if (localStorage.getItem('user_id')) {
        detai['user_id'] = localStorage.getItem('user_id');
    };

    if (localStorage.getItem('detai_id')) {
        detai['detai_id'] = localStorage.getItem('detai_id');
        localStorage.removeItem('detai_id');
    };

    sendDataDetai(detai, 'luu');
    huy();
    alert("Lưu đề tài thành công!");
};

function chon_de_tai() {
    let table = document.getElementById('tableDeTai');
    let checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn 1 đề tài.");
    } else if (checkboxes.length > 1) {
        alert("Vui lòng chỉ chọn 1 đề tài.");
    } else {
        let selectedRow = {};

        checkboxes.forEach(function(checkbox) {
          let row = checkbox.closest('tr');
          let cells = row.cells;
          selectedRow['ma_de_tai'] = cells[2].innerText;
          selectedRow['ten_te_tai'] = cells[3].innerText;
          selectedRow['nguoi_thuc_hien'] = cells[4].innerText;
          selectedRow['ngay_thuc_hien'] = cells[5].innerText;
          selectedRow['mo_ta'] = cells[6].innerText;
          selectedRow['detai_id'] = parseInt(cells[7].innerText);
        });

        if (localStorage.getItem('user_id')) {
            selectedRow['user_id'] = localStorage.getItem('user_id');
        };

        return selectedRow;
    }
};

function sua_de_tai() {
    selectedRow = chon_de_tai();
    document.getElementById('ten_de_tai').value = selectedRow['ten_te_tai'];
    document.getElementById('ma_de_tai').value = selectedRow['ma_de_tai'];
    document.getElementById('nguoi_thuc_hien').value = selectedRow['nguoi_thuc_hien'];
    document.getElementById('ngay_thuc_hien').value = selectedRow['ngay_thuc_hien'];
    document.getElementById('mo_ta').value = selectedRow['mo_ta'];
    localStorage.setItem('detai_id', JSON.stringify(selectedRow['detai_id']));
};

function xoa_de_tai() {
    selectedRow = chon_de_tai();
    sendDataDetai(selectedRow, 'xoa');
    alert("Xóa đề tài thành công!");
}

function huy() {
    document.getElementById('ten_de_tai').value = '';
    document.getElementById('ma_de_tai').value = '';
    document.getElementById('nguoi_thuc_hien').value = '';
    document.getElementById('ngay_thuc_hien').value = '';
    document.getElementById('mo_ta').value = '';
}

function sendDataDetai(data, action) {
    $.ajax({
      url: '/detai',
      method: 'POST',
      data: JSON.stringify({data: data, action: action}),
      contentType: 'application/json',
      success: function(response) {
        if (response.detaiList) {
            hienThiDeTai(response.detaiList);
        };

       if (localStorage.getItem('detai_id')) {
            localStorage.removeItem('detai_id');
       };
      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
};

const localStorageData = JSON.stringify(localStorage);
console.log(localStorageData);

