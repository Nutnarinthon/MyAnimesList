// เก็บข้อมูลอนิเมะ
let animeList = JSON.parse(localStorage.getItem('animeList')) || [];
let editingIndex = -1;

const animeForm = document.getElementById('animeForm');
const animeTableBody = document.getElementById('animeTableBody');
const btnSubmit = document.querySelector('.btn-add');

// ใช้ฟังก์ชันช่วยเหลือเพื่อล้างค่า HTML (กัน XSS เบื้องต้น)
const escapeHTML = (str) => {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
};

document.addEventListener('DOMContentLoaded', renderTable);

function saveToLocalStorage() {
    localStorage.setItem('animeList', JSON.stringify(animeList));
}

animeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // ดึงค่าและตัดช่องว่าง (trim)
    const data = {
        nameTh: document.getElementById('nameTh').value.trim(),
        nameEn: document.getElementById('nameEn').value.trim(),
        type: document.getElementById('type').value,
        page: document.getElementById('page').value,
        link: document.getElementById('link').value.trim()
    };

    if (!data.nameTh || !data.type) {
        alert('⚠️ อย่างน้อยต้องระบุชื่อไทยและสถานะ');
        return;
    }

    if (editingIndex === -1) {
        animeList.push(data);
        alert('✅ เพิ่มข้อมูลสำเร็จ');
    } else {
        animeList[editingIndex] = data;
        alert('✏️ แก้ไขข้อมูลสำเร็จ');
        editingIndex = -1;
        btnSubmit.textContent = 'เพิ่มข้อมูล';
        btnSubmit.classList.remove('btn-update'); // เปลี่ยนสีปุ่มกลับ (ถ้ามี)
    }

    saveToLocalStorage();
    renderTable();
    animeForm.reset();
});

function renderTable() {
    animeTableBody.innerHTML = '';

    if (animeList.length === 0) {
        animeTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">ไม่มีข้อมูลรายการอนิเมะ</td></tr>';
        return;
    }

    animeList.forEach((anime, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(anime.nameTh)}</td>
            <td>${escapeHTML(anime.nameEn)}</td>
            <td><span class="type-badge type-${anime.type}">${anime.type}</span></td>
            <td>${anime.page || '-'}</td>
            <td><a href="${anime.link}" target="_blank" class="link-go">🔗 ดู</a></td>
            <td>
                <button class="btn-action edit" onclick="editAnime(${index})">แก้ไข</button>
                <button class="btn-action delete" onclick="deleteAnime(${index})">ลบ</button>
            </td>
        `;
        animeTableBody.appendChild(row);
    });
}

window.editAnime = function(index) {
    editingIndex = index;
    const anime = animeList[index];

    document.getElementById('nameTh').value = anime.nameTh;
    document.getElementById('nameEn').value = anime.nameEn;
    document.getElementById('type').value = anime.type;
    document.getElementById('page').value = anime.page;
    document.getElementById('link').value = anime.link;

    btnSubmit.textContent = 'อัปเดตข้อมูล';
    btnSubmit.classList.add('btn-update'); 
    animeForm.scrollIntoView({ behavior: 'smooth' });
};

window.deleteAnime = function(index) {
    if (confirm(`🗑️ ต้องการลบ "${animeList[index].nameTh}" ?`)) {
        animeList.splice(index, 1);
        saveToLocalStorage();
        renderTable();
    }
};