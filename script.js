// עדכון דינמי של שדות התצוגה כאשר משנים את השדות בסרגל
function updateDisplayField(inputId, displayId, prefix = '', suffix = '', formatNumber = false) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (!input || !display) return; // בדיקה שהשדות קיימים
    
    // מצא את ה-container של השדה הזה
    const detailItem = display.parentElement;
    
    input.addEventListener('input', function() {
        if (input.value) {
            let displayValue = input.value;
            
            // פורמט מספרים עם פסיקים אם נדרש
            if (formatNumber && !isNaN(parseFloat(displayValue))) {
                displayValue = parseFloat(displayValue).toLocaleString('he-IL');
            }
            
            display.textContent = prefix + displayValue + suffix;
            
            // הצג את ה-detail item אם יש ערך
            detailItem.classList.remove('hidden-field');
        } else {
            display.textContent = '_________________';
            
            // הסתר את ה-detail item אם השדה ריק
            detailItem.classList.add('hidden-field');
        }
    });
    
    // בדיקה ראשונית בטעינת הדף
    if (!input.value) {
        detailItem.classList.add('hidden-field');
    }
}

// פונקציה לבדיקת הסתרת שדות ריקים
function initializeFieldVisibility() {
    // בדיקת כל השדות וסימון שדות ריקים כמוסתרים
    document.querySelectorAll('[id^="display-"]').forEach(display => {
        // דלג על שדות קבועים
        if (['display-logo', 'display-advisor-name', 'display-advisor-phone', 
             'display-advisor-email', 'display-company'].includes(display.id)) {
            return;
        }
        
        const detailItem = display.parentElement;
        if (display.textContent === '_________________' || 
            display.textContent === 'אין הערות נוספות' || 
            display.textContent === '₪ 0') {
            detailItem.classList.add('hidden-field');
        }
    });
}

// קוד האתחול - יופעל לאחר טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    // קביעת פרטי היועץ הקבועים
    document.getElementById('display-advisor-name').textContent = 'תומר הדר, יועץ משכנתאות';
    document.getElementById('display-advisor-phone').textContent = '052-5218274';
    document.getElementById('display-advisor-email').textContent = 'tomerhadar1@gmail.com';
    document.getElementById('display-company').textContent = 'הדר משכנתאות וליווי פיננסי';
    
    // הוספת פונקציונליות למחיקת לווה
    document.querySelectorAll('.remove-client').forEach(button => {
        button.addEventListener('click', removeClient);
    });
    
    // פונקציה להסרת לווה
    function removeClient() {
        const clientForm = this.closest('.client-form');
        const clientContainer = clientForm.parentElement;
        const clientDisplayContainer = document.getElementById('display-clients-container');
        const formIndex = Array.from(clientContainer.children).indexOf(clientForm);
        
        // בדיקה אם זה הלווה האחרון
        if (clientContainer.children.length === 1) {
            alert('חייב להישאר לפחות לווה אחד. ניתן למחוק את השדות אבל לא את הטופס.');
            
            // איפוס שדות הלווה האחרון במקום מחיקתו
            clientForm.querySelectorAll('input').forEach(input => {
                input.value = '';
                // הפעלת אירוע input כדי לעדכן את התצוגה
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            });
            
            return;
        }
        
        // הסרת הטופס והתצוגה
        clientContainer.removeChild(clientForm);
        const clientDisplay = clientDisplayContainer.children[formIndex];
        clientDisplayContainer.removeChild(clientDisplay);
        
        // עדכון מספרי הלווים
        clientContainer.querySelectorAll('.client-form').forEach((form, index) => {
            form.querySelector('.client-title').textContent = `לווה ${index + 1}`;
        });
        
        clientDisplayContainer.querySelectorAll('.client-subtitle').forEach((subtitle, index) => {
            subtitle.textContent = `לווה ${index + 1}`;
        });
    }

    // עדכון שדות התצוגה כאשר משנים את השדות בסרגל
    updateDisplayField('client-name', 'display-client-name');
    updateDisplayField('client-phone', 'display-client-phone');
    updateDisplayField('client-address', 'display-client-address');
    updateDisplayField('client-city', 'display-client-city');
    updateDisplayField('service-type', 'display-service-type');
    updateDisplayField('payment-terms', 'display-payment-terms');
    updateDisplayField('quote-notes', 'display-notes');
    updateDisplayField('advisory-fee', 'display-fee', '₪ ', '', true);

    // עדכון תאריך תוקף
    document.getElementById('quote-expiry').addEventListener('change', function() {
        const date = new Date(this.value);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('display-expiry').textContent = date.toLocaleDateString('he-IL', options);
    });

    // הוספת לווה נוסף
    document.getElementById('add-client').addEventListener('click', function() {
        const clientsContainer = document.getElementById('clients-container');
        const displayClientsContainer = document.getElementById('display-clients-container');
        const clientCount = clientsContainer.querySelectorAll('.client-form').length + 1;
        
        // יצירת טופס הזנת נתונים חדש
        const newClientForm = document.createElement('div');
        newClientForm.className = 'client-form';
        newClientForm.innerHTML = `
            <div class="client-header">
                <span class="client-title">לווה ${clientCount}</span>
                <button type="button" class="remove-client">הסר</button>
            </div>
            
            <label for="client-name-${clientCount}">שם הלקוח</label>
            <input type="text" id="client-name-${clientCount}" placeholder="שם הלקוח" class="client-name-input">
            
            <label for="client-phone-${clientCount}">טלפון</label>
            <input type="text" id="client-phone-${clientCount}" placeholder="טלפון">
            
            <label for="client-address-${clientCount}">כתובת</label>
            <input type="text" id="client-address-${clientCount}" placeholder="כתובת">
            
            <label for="client-city-${clientCount}">עיר</label>
            <input type="text" id="client-city-${clientCount}" placeholder="עיר">
        `;
        
        // יצירת הצגת הנתונים בהצעת המחיר
        const newClientDisplay = document.createElement('div');
        newClientDisplay.className = 'client-details';
        newClientDisplay.innerHTML = `
            <h4 class="client-subtitle">לווה ${clientCount}</h4>
            <div class="detail-item">
                <div class="detail-label">שם הלקוח</div>
                <div id="display-client-name-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">טלפון</div>
                <div id="display-client-phone-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">כתובת</div>
                <div id="display-client-address-${clientCount}">_________________</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">עיר</div>
                <div id="display-client-city-${clientCount}">_________________</div>
            </div>
        `;
        
        clientsContainer.appendChild(newClientForm);
        displayClientsContainer.appendChild(newClientDisplay);
        
        // הוספת מאזיני אירועים לשדות החדשים
        updateDisplayField(`client-name-${clientCount}`, `display-client-name-${clientCount}`);
        updateDisplayField(`client-phone-${clientCount}`, `display-client-phone-${clientCount}`);
        updateDisplayField(`client-address-${clientCount}`, `display-client-address-${clientCount}`);
        updateDisplayField(`client-city-${clientCount}`, `display-client-city-${clientCount}`);
        
        // הוספת מאזין אירועים לכפתור ההסרה
        newClientForm.querySelector('.remove-client').addEventListener('click', removeClient);
    });

    // פונקציה ליצירת קובץ PDF
    document.getElementById('generate-pdf').addEventListener('click', function() {
        const element = document.getElementById('quote-to-print');
        
        // קבלת שם הלקוח לשם הקובץ
        const clientNameInput = document.querySelector('.client-name-input');
        let fileName = 'הצעת מחיר ייעוץ משכנתא';
        
        if (clientNameInput && clientNameInput.value) {
            fileName += ' - ' + clientNameInput.value;
        }
        
        // יצירת אובייקט עם אפשרויות לספריה
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
            
            // הוספת סגנון להסתרת סקשנים ריקים
            printWindow.document.write(`
                <style>
                    .hidden-section {
                        display: none !important;
                    }
                </style>
            `);
            
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
            
            // השארת רק לווה אחד
            const clientsContainer = document.getElementById('clients-container');
            const displayClientsContainer = document.getElementById('display-clients-container');
            
            const clientForms = clientsContainer.querySelectorAll('.client-form');
            const clientDisplays = displayClientsContainer.querySelectorAll('.client-details');
            
            // מחיקת לווים נוספים (השאר את הראשון)
            for (let i = 1; i < clientForms.length; i++) {
                clientsContainer.removeChild(clientForms[i]);
            }
            
            for (let i = 1; i < clientDisplays.length; i++) {
                displayClientsContainer.removeChild(clientDisplays[i]);
            }
            
            // הסתרת סקשנים ריקים
            checkSectionVisibility();
        }
    });

    // אתחול הדף - הסתרת שדות ריקים בטעינה
    initializeFieldVisibility();
});