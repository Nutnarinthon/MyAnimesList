// URL ของ Google Apps Script Web App
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyF-csWFGKwzpOAw0nAJRVJO67xKL5pJRgP_HSp7UiAQKX0gMdKGehfa_nVJrQQ8-aX/exec";

let animeList = [];
let editingIndex = -1;

const animeForm = document.getElementById('animeForm');
const animeTableBody = document.getElementById('animeTableBody');
const btnSubmit = document.querySelector('.btn-add');

// ฟังก์ชันดึงข้อมูลจาก Google Sheets เมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', fetchData);

async function fetchData() {
    animeTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">⏳ กำลังโหลดข้อมูล...</td></tr>';
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        animeList = data; // สมมติว่า API ส่งกลับมาเป็น Array ของ Object
        renderTable();
    } catch (error) {
        console.error('Error:', error);
        animeTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red; padding:20px;">❌ ไม่สามารถโหลดข้อมูลได้</td></tr>';
    }
}

const escapeHTML = (str) => {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
};

// จัดการการส่งฟอร์ม (เพิ่ม/แก้ไข)
animeForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const data = {
        action: editingIndex === -1 ? 'insert' : 'update',
        index: editingIndex, // ส่งลำดับแถวไปถ้าเป็นการแก้ไข
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

    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ กำลังบันทึก...';

    try {
        // ส่งข้อมูลไปยัง Google Apps Script
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // สำคัญ: Google Script มักติด CORS แต่ส่งแบบ no-cors ข้อมูลจะเข้า Google Sheets
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // เนื่องด้วย no-cors เราไม่สามารถอ่าน response ได้ จึงต้องอาศัยการหน่วงเวลาหรือโหลดใหม่
        alert('✅ บันทึกข้อมูลสำเร็จ (อาจใช้เวลาอัปเดตสักครู่)');
        
        // ล้างค่าฟอร์มและรีเซ็ตสถานะ
        editingIndex = -1;
        btnSubmit.textContent = 'เพิ่มข้อมูล';
        btnSubmit.classList.remove('btn-update');
        btnSubmit.disabled = false;
        animeForm.reset();
        
        // โหลดข้อมูลใหม่ (หรือจะ push เข้า animeList ชั่วคราวก็ได้)
        setTimeout(fetchData, 1500); 

    } catch (error) {
        alert('❌ เกิดข้อผิดพลาดในการบันทึก');
        btnSubmit.disabled = false;
        console.error(error);
    }
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

window.deleteAnime = async function(index) {
    if (confirm(`🗑️ ต้องการลบ "${animeList[index].nameTh}" ?`)) {
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'delete', index: index })
            });
            alert('🗑️ ลบข้อมูลเรียบร้อย');
            setTimeout(fetchData, 1000);
        } catch (error) {
            alert('❌ ไม่สามารถลบได้');
        }
    }
};
