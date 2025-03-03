// חיבור שדות שהיו חסרים
updateDisplayField('client-name', 'display-client-name');
updateDisplayField('client-id', 'display-client-id');
updateDisplayField('client-phone', 'display-client-phone');
updateDisplayField('client-address', 'display-client-address');
updateDisplayField('client-city', 'display-client-city');// הסרת קוד העלאת לוגו שכבר לא בשימוש ושימוש בלוגו קבוע
/*
document.getElementById('logo-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoPreview = document.getElementById('logo-preview');
            const displayLogo = document.getElementById('display-logo');
            
            logoPreview.src = event.target.result;
            displayLogo.src = event.target.result;
            
            logoPreview.style.display = 'block';
            displayLogo.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});
*/

// עדכון דינמי של שדות התצוגה כאשר משנים את השדות בסרגל
function updateDisplayField(inputId, displayId, prefix = '', suffix = '', formatNumber = false) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (!input || !display) return; // בדיקה שהשדות קיימים
    
    input.addEventListener('input', function() {
        if (input.value) {
            let displayValue = input.value;
            
            // פורמט מספרים עם פסיקים אם נדרש
            if (formatNumber && !isNaN(parseFloat(displayValue))) {
                displayValue = parseFloat(displayValue).toLocaleString('he-IL');
            }
            
            display.textContent = prefix + displayValue + suffix;
        } else {
            display.textContent = '_________________';
        }
        
        // חישוב LTV אם משנים את סכום ההלוואה או שווי הנכס
        if (inputId === 'property-value' || inputId === 'loan-amount') {
            calculateLTV();
        }
        
        // עדכון טבלת המסלולים
        if (inputId.includes('track')) {
            updateTracksTable();
        }
    });
}

// חישוב LTV
function calculateLTV() {
    const propertyValue = parseFloat(document.getElementById('property-value').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    
    if (propertyValue > 0) {
        const ltv = (loanAmount / propertyValue * 100).toFixed(1);
        document.getElementById('display-ltv').textContent = ltv + '%';
    } else {
        document.getElementById('display-ltv').textContent = '_________________';
    }
}

// קביעת פרטי היועץ הקבועים
document.getElementById('display-advisor-name').textContent = 'תומר הדר, יועץ משכנתאות';
document.getElementById('display-advisor-phone').textContent = '052-5218274';
document.getElementById('display-advisor-email').textContent = 'tomerhadar1@gmail.com';
document.getElementById('display-company').textContent = 'הדר משכנתאות וליווי פיננסי';

updateDisplayField('client-name', 'display-client-name');
updateDisplayField('client-id', 'display-client-id');
updateDisplayField('client-phone', 'display-client-phone');
updateDisplayField('client-address', 'display-client-address');

updateDisplayField('property-value', 'display-property-value', '₪ ');
updateDisplayField('loan-amount', 'display-loan-amount', '₪ ');
updateDisplayField('loan-purpose', 'display-loan-purpose');
updateDisplayField('quote-notes', 'display-notes');
updateDisplayField('advisory-fee', 'display-fee', '₪ ');

// עדכון תאריך תוקף
document.getElementById('quote-expiry').addEventListener('change', function() {
    const date = new Date(this.value);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('display-expiry').textContent = date.toLocaleDateString('he-IL', options);
});

// הוספת מסלול חדש
document.getElementById('add-track').addEventListener('click', function() {
    const tracksContainer = document.getElementById('loan-tracks');
    const trackCount = tracksContainer.querySelectorAll('.loan-track').length + 1;
    
    const newTrack = document.createElement('div');
    newTrack.className = 'loan-track';
    newTrack.innerHTML = `
        <label>מסלול ${trackCount}</label>
        <select class="track-type">
            <option value="פריים">פריים</option>
            <option value="קבועה צמודה">קבועה צמודה</option>
            <option value="קבועה לא צמודה">קבועה לא צמודה</option>
            <option value="משתנה כל 5 שנים">משתנה כל 5 שנים</option>
        </select>
        <label>סכום (₪)</label>
        <input type="number" class="track-amount" placeholder="סכום">
        <label>תקופה (שנים)</label>
        <input type="number" class="track-period" placeholder="תקופה">
        <label>ריבית (%)</label>
        <input type="number" class="track-interest" step="0.01" placeholder="ריבית">
    `;
    
    tracksContainer.appendChild(newTrack);
    
    // הוספת מאזינים לאירועים
    newTrack.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updateTracksTable);
    });
});

// חישוב תשלום חודשי
function calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) return principal / months;
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
}

// עדכון טבלת המסלולים
function updateTracksTable() {
    const tracksTable = document.getElementById('tracks-table');
    tracksTable.innerHTML = '';
    
    let totalAmount = 0;
    let totalMonthly = 0;
    
    document.querySelectorAll('.loan-track').forEach((track, index) => {
        const type = track.querySelector('.track-type').value;
        const amount = parseFloat(track.querySelector('.track-amount').value) || 0;
        const period = parseFloat(track.querySelector('.track-period').value) || 0;
        const interest = parseFloat(track.querySelector('.track-interest').value) || 0;
        
        totalAmount += amount;
        
        // חישוב החזר חודשי
        const monthlyPayment = calculateMonthlyPayment(amount, interest, period);
        totalMonthly += monthlyPayment;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>₪ ${amount.toLocaleString()}</td>
            <td>${period} שנים</td>
            <td>${interest.toFixed(2)}%</td>
            <td>₪ ${Math.round(monthlyPayment).toLocaleString()}</td>
        `;
        
        tracksTable.appendChild(row);
    });
    
    document.getElementById('total-amount').textContent = `₪ ${totalAmount.toLocaleString()}`;
    document.getElementById('total-monthly').textContent = `₪ ${Math.round(totalMonthly).toLocaleString()}`;
}

// הפעלת מאזינים לאירועים על המסלול הראשון
document.querySelectorAll('.loan-track input, .loan-track select').forEach(input => {
    input.addEventListener('input', updateTracksTable);
});

// פונקציה ליצירת קובץ PDF
document.getElementById('generate-pdf').addEventListener('click', function() {
    const element = document.getElementById('quote-to-print');
    
    // קבלת שם הלקוח לשם הקובץ
    const clientNameInput = document.querySelector('.client-name-input');
    let fileName = 'הצעת_מחיר_ייעוץ_משכנתא';
    
    if (clientNameInput && clientNameInput.value) {
        fileName += '_' + clientNameInput.value.replace(/\s+/g, '_');
    }
    
    // יצירת אובייקט עם אפשרויות לספריה החדשה
    const opt = {
        margin: 10,
        filename: fileName + '.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        }
    };
    
    // נסה תחילה עם הספריה המקורית
    try {
        // שימוש בגרסת html2pdf שזמינה כבר
        html2pdf()
            .from(element)
            .set(opt)
            .toPdf()
            .get('pdf')
            .then(function(pdf) {
                window.open(pdf.output('bloburl'), '_blank');
            })
            .catch(error => {
                console.error('שגיאה ביצירת PDF עם html2pdf:', error);
                fallbackPDF();
            });
    } catch (error) {
        console.error('שגיאה בטעינת ספריית html2pdf:', error);
        fallbackPDF();
    }
    
    // אלטרנטיבה במקרה של כישלון הספרייה העיקרית
    function fallbackPDF() {
        alert('מתבצע ניסיון יצירת PDF בשיטה חלופית...');
        
        // פתרון חלופי - הדפסה באמצעות דפדפן
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            alert('הדפדפן חסם את החלון הקופץ. אנא אפשר חלונות קופצים ונסה שנית.');
            return;
        }
        
        printWindow.document.write('<html><head><title>' + fileName + '</title>');
        printWindow.document.write('<style>');
        // העתקת הסגנונות
        const styles = document.getElementsByTagName('style');
        for (let i = 0; i < styles.length; i++) {
            printWindow.document.write(styles[i].innerHTML);
        }
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
            if (links[i].rel === 'stylesheet') {
                printWindow.document.write(
                    `<link rel="stylesheet" href="${links[i].href}">`
                );
            }
        }
        printWindow.document.write('</style></head><body>');
        
        // רק את תוכן ההצעה
        printWindow.document.write(element.innerHTML);
        
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // המתנה לטעינת התוכן
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
        };
    }
});

// איפוס הטופס
document.getElementById('reset-form').addEventListener('click', function() {
    const confirmation = confirm('האם אתה בטוח שברצונך לנקות את כל הנתונים?');
    if (confirmation) {
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('[id^="display-"]').forEach(display => {
            if (!['display-logo', 'display-advisor-name', 'display-advisor-phone', 'display-advisor-email', 'display-company'].includes(display.id)) {
                display.textContent = '_________________';
            }
        });
        
        // השארת רק מסלול אחד
        const tracksContainer = document.getElementById('loan-tracks');
        const tracks = tracksContainer.querySelectorAll('.loan-track');
        
        for (let i = 1; i < tracks.length; i++) {
            tracksContainer.removeChild(tracks[i]);
        }
        
        updateTracksTable();
    }
});

// אתחול הדף
updateTracksTable();