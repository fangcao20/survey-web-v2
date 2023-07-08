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
        let divs = document.querySelectorAll('[data-draggable="target"]');
        for (let div of divs) {
            div.innerHTML = '';
        }
        sendDataKetQua(data, 'chondetai');
        document.getElementById('phanloaibien').style.visibility = 'visible';
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
    document.getElementById('phanloaibien').style.visibility = 'hidden';
}

function tuteptin() {
    if (localStorage.getItem('detai_id')) {
        localStorage.removeItem('detai_id');
    }
    document.getElementById('phanloaibien').style.visibility = 'hidden';
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
      if (response.ketquas) {
        hienKetQuaDeTai(response.ketquas);
        hienLoaiBien(response.loaibien);
      }
      console.log("success");
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function hienKetQuaDeTai(ketquas) {
    console.log(ketquas);
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

function hienLoaiBien(loaibien) {
    let bienmota = loaibien['bienmota'];
    let biendoclap = loaibien['biendoclap'];
    let html1 = '';

    for (let bien of bienmota) {
        html1 += `<p data-draggable="item">${bien}</p>`;
    }

    for (let bien of biendoclap) {
        html1 += `<p data-draggable="item">${bien}</p>`;
    }

    document.getElementById('bodyTableDanhSachBien').innerHTML = html1;
    phanLoaiBien();
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
        let row1 = jsonData[1];
        let bienMoTa = []
        let bienDocLap = []
        for (let i=0; i < row1.length; i++) {
            if (parseFloat(row1[i])) {
                bienDocLap.push(header[i]);
            } else {
                bienMoTa.push(header[i]);
            }
        }
        hienLoaiBien({'bienmota': bienMoTa, 'biendoclap': bienDocLap});
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
        document.getElementById('phanloaibien').style.visibility = 'visible';
    };
    reader.readAsArrayBuffer(file);
};

function tai_du_lieu() {
    let table = document.querySelector('#input_detai > div > table');
    let rows = table.querySelectorAll('tr');
    let data = [];
    for (const row of rows) {
        let rowData = [];
        const cells = row.querySelectorAll('td, th');
        for (const cell of cells) {
          rowData.push(cell.textContent.trim());
        }
    data.push(rowData);
    }
     // Tạo workbook mới từ dữ liệu
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

      // Chuyển đổi workbook thành dạng binary
      const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

      // Tạo ArrayBuffer từ dữ liệu binary
      const buffer = new ArrayBuffer(excelData.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < excelData.length; i++) {
        view[i] = excelData.charCodeAt(i) & 0xFF;
      }

      // Tạo đối tượng Blob từ ArrayBuffer
      const blob = new Blob([buffer], { type: 'application/octet-stream' });

      // Tạo URL và thực hiện tải xuống
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.xlsx';
      link.click();

      // Giải phóng URL
      URL.revokeObjectURL(url);
}

function phanLoaiBien() {
    for (var
        targets = document.querySelectorAll('[data-draggable="target"]'),
        len = targets.length,
        i = 0; i < len; i ++) {
        targets[i].setAttribute('aria-dropeffect', 'none');
    }

    for (var
        items = document.querySelectorAll('[data-draggable="item"]'),
        len = items.length,
        i = 0; i < len; i ++) {
        items[i].setAttribute('draggable', 'true');
        items[i].setAttribute('aria-grabbed', 'false');
        items[i].setAttribute('tabindex', '0');
    }

    var selections = {
        items      : [],
        owner      : null,
        droptarget : null
    };

    function addSelection(item){
        if(!selections.owner){
            selections.owner = item.parentNode;
        }
        else if(selections.owner != item.parentNode){
            return;
        }

        item.setAttribute('aria-grabbed', 'true');
        selections.items.push(item);
    }

    function removeSelection(item) {
        item.setAttribute('aria-grabbed', 'false');
        for(var len = selections.items.length, i = 0; i < len; i ++) {
            if(selections.items[i] == item) {
                selections.items.splice(i, 1);
                break;
            }
        }
    }

    function clearSelections() {
        if(selections.items.length) {
            selections.owner = null;
            for(var len = selections.items.length, i = 0; i < len; i ++) {
                selections.items[i].setAttribute('aria-grabbed', 'false');
            }
            selections.items = [];
        }
    }

    function hasModifier(e) {
        return (e.ctrlKey || e.metaKey || e.shiftKey);
    }

    function addDropeffects() {
        for(var len = targets.length, i = 0; i < len; i ++) {
            if (targets[i] != selections.owner && targets[i].getAttribute('aria-dropeffect') == 'none') {
                targets[i].setAttribute('aria-dropeffect', 'move');
                targets[i].setAttribute('tabindex', '0');
            }
        }
        for(var len = items.length, i = 0; i < len; i ++) {
            if (items[i].parentNode != selections.owner && items[i].getAttribute('aria-grabbed')) {
                items[i].removeAttribute('aria-grabbed');
                items[i].removeAttribute('tabindex');
            }
        }
    }

    function clearDropeffects() {
        if(selections.items.length) {
            for(var len = targets.length, i = 0; i < len; i ++) {
                if(targets[i].getAttribute('aria-dropeffect') != 'none') {
                    targets[i].setAttribute('aria-dropeffect', 'none');
                    targets[i].removeAttribute('tabindex');
                }
            }
            for(var len = items.length, i = 0; i < len; i ++) {
                if(!items[i].getAttribute('aria-grabbed')) {
                    items[i].setAttribute('aria-grabbed', 'false');
                    items[i].setAttribute('tabindex', '0');
                }
                else if(items[i].getAttribute('aria-grabbed') == 'true') {
                    items[i].setAttribute('tabindex', '0');
                }
            }
        }
    }

    function getContainer(element) {
        do {
            if(element.nodeType == 1 && element.getAttribute('aria-dropeffect')) {
                return element;
            }
        }
        while(element = element.parentNode);
        return null;
    }

    document.addEventListener('mousedown', function(e) {
        if(e.target.getAttribute('draggable')) {
            clearDropeffects();
            if ( !hasModifier(e) && e.target.getAttribute('aria-grabbed') == 'false' ) {
                clearSelections();
                addSelection(e.target);
            }
        }
        else if(!hasModifier(e)) {
            clearDropeffects();
            clearSelections();
        } else {
            clearDropeffects();
        }
    }, false);

    document.addEventListener('mouseup', function(e) {
        if(e.target.getAttribute('draggable') && hasModifier(e)) {
            if(e.target.getAttribute('aria-grabbed') == 'true') {
                removeSelection(e.target);
                if(!selections.items.length) {
                    selections.owner = null;
                }
            } else {
                addSelection(e.target);
            }
        }
    }, false);

    document.addEventListener('dragstart', function(e) {
        if(selections.owner != e.target.parentNode) {
            e.preventDefault();
            return;
        }
        if( hasModifier(e)  && e.target.getAttribute('aria-grabbed') == 'false' ) {
            addSelection(e.target);
        }
        e.dataTransfer.setData('text', '');
        addDropeffects();
    }, false);

    document.addEventListener('keydown', function(e) {
        if(e.target.getAttribute('aria-grabbed')) {
            if(e.keyCode == 32) {
                if(hasModifier(e)) {
                    if(e.target.getAttribute('aria-grabbed') == 'true') {
                        if(selections.items.length == 1) {
                            clearDropeffects();
                        }
                        removeSelection(e.target);
                        if(selections.items.length) {
                            addDropeffects();
                        }
                        if(!selections.items.length) {
                            selections.owner = null;
                        }
                    } else {
                        addSelection(e.target);
                        addDropeffects();
                    }
                } else if(e.target.getAttribute('aria-grabbed') == 'false') {
                    clearDropeffects();
                    clearSelections();
                    addSelection(e.target);
                    addDropeffects();
                } else {
                    addDropeffects();
                }
                e.preventDefault();
            }

            if(e.keyCode == 77 && hasModifier(e)) {
                if(selections.items.length) {
                    addDropeffects();
                    if(selections.owner == targets[targets.length - 1]) {
                        targets[0].focus();
                    } else {
                        for(var len = targets.length, i = 0; i < len; i ++) {
                            if(selections.owner == targets[i]) {
                                targets[i + 1].focus();
                                break;
                            }
                        }
                    }
                }
                e.preventDefault();
            }
        }

        if(e.keyCode == 27) {
            if(selections.items.length) {
                clearDropeffects();
                selections.items[selections.items.length - 1].focus();
                clearSelections();
            }
        }
    }, false);

    var related = null;
    document.addEventListener('dragenter', function(e) {
        related = e.target;
    }, false);

    document.addEventListener('dragleave', function(e) {
        var droptarget = getContainer(related);
        if(droptarget == selections.owner) {
            droptarget = null;
        }
        if(droptarget != selections.droptarget) {
            if(selections.droptarget) {
                selections.droptarget.className = selections.droptarget.className.replace(/ dragover/g, '');
            }
            if(droptarget) {
                droptarget.className += ' dragover';
            }
            selections.droptarget = droptarget;
        }
    }, false);

    document.addEventListener('dragover', function(e) {
        if(selections.items.length) {
            e.preventDefault();
        }

    }, false);

    document.addEventListener('dragend', function(e) {
        if(selections.droptarget) {
            for(var len = selections.items.length, i = 0; i < len; i ++) {
                selections.droptarget.appendChild(selections.items[i]);
            }
            e.preventDefault();
        }
        if(selections.items.length) {
            clearDropeffects();
            if(selections.droptarget) {
                clearSelections();
                selections.droptarget.className = selections.droptarget.className.replace(/ dragover/g, '');
                selections.droptarget = null;
            }
        }
    }, false);
}

function danhgiasobo() {
    let bienMoTa = [];
    let bienmota = document.querySelectorAll('#bienmota > p');
    if (bienmota.length > 0) {
        for (let bien of bienmota) {
            bienMoTa.push(bien.innerHTML);
        }
    }
    let bienDocLap = [];
    let biendoclap = document.querySelectorAll('#biendoclap > p');
    if (biendoclap.length > 0) {
        for (let bien of biendoclap) {
            bienDocLap.push(bien.innerHTML);
        }
    }
    let bienPhuThuoc = [];
    let bienphuthuoc = document.querySelectorAll('#bienphuthuoc > p');
    if (bienphuthuoc.length > 0) {
        for (let bien of bienphuthuoc) {
            bienPhuThuoc.push(bien.innerHTML);
        }
    }
    let data = {
        'bienmota': bienMoTa,
        'biendoclap': bienDocLap,
        'bienphuthuoc': bienPhuThuoc
    };
    sendData(data, 'phanloaibien');
}

function sendData(data, action) {
  $.ajax({
    url: '/danhgiasobo',
    method: 'POST',
    data: JSON.stringify({ data: data, action: action }),
    contentType: 'application/json',
    success: function(response) {
        window.open('/danhgiasobo', '_blank');
    },
    error: function(error) {
      console.log(error);
    }
  });
}


function danhgiachinhthuc() {
    let bienMoTa = [];
    let bienmota = document.querySelectorAll('#bienmota > p');
    if (bienmota.length > 0) {
        for (let bien of bienmota) {
            bienMoTa.push(bien.innerHTML);
        }
    }
    let bienDocLap = [];
    let biendoclap = document.querySelectorAll('#biendoclap > p');
    if (biendoclap.length > 0) {
        for (let bien of biendoclap) {
            bienDocLap.push(bien.innerHTML);
        }
    }
    let bienPhuThuoc = [];
    let bienphuthuoc = document.querySelectorAll('#bienphuthuoc > p');
    if (bienphuthuoc.length > 0) {
        for (let bien of bienphuthuoc) {
            bienPhuThuoc.push(bien.innerHTML);
        }
    }
    let data = {
        'bienmota': bienMoTa,
        'biendoclap': bienDocLap,
        'bienphuthuoc': bienPhuThuoc
    };
    sendDataCT(data, 'phanloaibien');
}

function sendDataCT(data, action) {
  $.ajax({
    url: '/danhgiasobo',
    method: 'POST',
    data: JSON.stringify({ data: data, action: action }),
    contentType: 'application/json',
    success: function(response) {
        window.open('/danhgiachinhthuc', '_blank');
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function chon_toan_bo() {
    let checkbox = document.querySelector('#phanloaibien > div.danhsachbien > span > input[type=checkbox]');
    if (checkbox.checked) {
        let biens = document.querySelectorAll('#bodyTableDanhSachBien > p');
        for (let bien of biens) {
            let parent = document.getElementById('biendoclap');
            parent.appendChild(bien);
        }
    }
}