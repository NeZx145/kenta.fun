// ============ SECURITY PROTECTION ============

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+S (Save Page)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+P (Print - can reveal source)
    if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
    }
    
    // Allow Ctrl+A in input fields
    if (e.ctrlKey && e.keyCode === 65) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    }
});

// Disable text selection (but allow in input fields)
document.addEventListener('selectstart', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// Disable drag and drop
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// Disable copy (but allow in input fields)
document.addEventListener('copy', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.clipboardData.setData('text/plain', '');
    e.preventDefault();
    return false;
});

// Disable cut (but allow in input fields)
document.addEventListener('cut', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.clipboardData.setData('text/plain', '');
    e.preventDefault();
    return false;
});

// Allow paste in input fields
document.addEventListener('paste', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// Detect DevTools opening and close the site
let devtools = {
    open: false,
    checkCount: 0
};

function detectDevTools() {
    // More accurate detection with higher thresholds
    const widthThreshold = 200;
    const heightThreshold = 200;
    
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    // Check if DevTools is open
    if (widthDiff > widthThreshold || heightDiff > heightThreshold) {
        devtools.checkCount++;
        
        // After 2 consecutive detections, close the site
        if (devtools.checkCount >= 2 && !devtools.open) {
            devtools.open = true;
            closeSite();
        }
    } else {
        // Reset if DevTools seems closed
        if (devtools.checkCount > 0) {
            devtools.checkCount = 0;
            devtools.open = false;
        }
    }
}

function closeSite() {
    // Clear the page and show message
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #000; color: #b10000; font-family: Arial, sans-serif;">
            <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 0 0 20px rgba(177, 0, 0, 0.5);">⚠️ Developer Tools Detected</h1>
            <p style="font-size: 24px; color: #fff; margin-bottom: 30px;">This site is protected. Please close Developer Tools to continue.</p>
            <p style="font-size: 16px; color: #888;">The page will redirect automatically...</p>
        </div>
    `;
    
    // Redirect after 3 seconds
    setTimeout(function() {
        window.location.href = 'about:blank';
    }, 3000);
    
    // Also try to close the window
    setTimeout(function() {
        window.close();
    }, 2000);
}

// Check for DevTools every second
setInterval(detectDevTools, 1000);

// Additional detection using debugger
(function() {
    let devtools = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            devtools = true;
            closeSite();
        }
    });
    
    setInterval(function() {
        devtools = false;
        console.log(element);
        if (devtools) {
            closeSite();
        }
    }, 1000);
})();

// Disable image right-click (additional protection)
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        img.setAttribute('draggable', 'false');
    });
});

// Console warning
console.log('%c⚠️ WARNING ⚠️', 'color: #b10000; font-size: 50px; font-weight: bold;');
console.log('%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam and will give them access to your account.', 'color: #fff; font-size: 16px;');

// Clear console periodically (less aggressive)
setInterval(function() {
    if (console.clear) {
        try {
            console.clear();
        } catch(e) {}
    }
}, 3000);

