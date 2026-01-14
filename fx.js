document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SÉLECTION DES ÉLÉMENTS DOM ---
    const trigger = document.getElementById('triggerZone');
    const panel = document.getElementById('chatPanel');
    const closeBtn = document.getElementById('closeBtn');
    const touchGlow = document.getElementById('touchGlow'); // Le tracker lumineux
    const body = document.body;

    // --- 2. SÉQUENCE TEMPORELLE (États n0 -> n1 -> n2) ---
    // Cette partie gère l'animation d'intro et l'apparition de l'étiquette
    
    setTimeout(() => {
        // n0 -> n1 : Animation d'amorçage (Sort et rentre)
        trigger.classList.add('intro-anim');
        
        // Une fois l'intro finie, on passe en mode PULSE
        setTimeout(() => {
            trigger.classList.remove('intro-anim');
            trigger.classList.add('pulse');
        }, 1500);

        // n2 : Apparition de l'étiquette après quelques secondes
        setTimeout(() => {
            trigger.setAttribute('data-label', 'Un conseil ?');
            trigger.classList.add('flag-visible');
            
            // On cache l'étiquette après 4s
            setTimeout(() => {
                trigger.classList.remove('flag-visible');
            }, 4000);
        }, 4500);

    }, 1000); // Démarre 1s après le chargement


    // --- 3. LOGIQUE PHYSIQUE (DRAG & GLOW) ---
    
    let isDragging = false;
    let startX = 0;
    const dragThreshold = 0.3; // 30% de l'écran pour déclencher l'ouverture

    // Fonction Helper : Met à jour la position verticale de la lumière
    const updateGlowPosition = (clientY) => {
        // Position du trigger par rapport à la fenêtre
        const rect = trigger.getBoundingClientRect();
        
        // Calcul de la position Y relative à l'intérieur du trigger
        let relativeY = clientY - rect.top;
        
        // On limite pour que la lumière ne sorte pas de la zone (clamp)
        relativeY = Math.max(0, Math.min(relativeY, rect.height));
        
        // Application au style CSS
        touchGlow.style.top = `${relativeY}px`;
    };

    // A. DÉBUT DU GESTE (Start)
    const startDrag = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        
        // Feedback Visuel :
        // 1. On active la distorsion et on affiche la lumière
        trigger.classList.add('active-touch'); 
        // 2. On arrête les animations automatiques (pulse/intro) pour prendre le contrôle
        trigger.classList.remove('pulse', 'intro-anim');
        
        // 3. On place la lumière immédiatement sous le doigt
        updateGlowPosition(clientY);

        // Performance : On coupe les transitions CSS pour un suivi 1:1 sans latence
        trigger.style.transition = 'none';
        panel.style.transition = 'none';
    };

    // B. PENDANT LE GESTE (Move)
    const moveDrag = (clientX, clientY) => {
        if (!isDragging) return;
        
        // 1. Mise à jour de la lumière (Axe Y)
        updateGlowPosition(clientY);

        // 2. Calcul du déplacement (Axe X)
        const delta = clientX - startX; // Négatif si on va vers la gauche
        
        // On autorise seulement le mouvement vers la gauche
        if (delta < 0) {
            // Déplacement du Trigger (avec effet élastique via CSS transform)
            trigger.style.transform = `translateY(-50%) translateX(${delta}px)`;
            
            // Le Panneau suit le mouvement
            const panelWidth = panel.offsetWidth;
            const newPos = Math.max(0, panelWidth + delta);
            panel.style.transform = `translateX(${newPos}px)`;
        }
    };

    // C. FIN DU GESTE (End)
    const endDrag = (clientX) => {
        if (!isDragging) return;
        isDragging = false;
        
        // Nettoyage visuel
        trigger.classList.remove('active-touch'); // Retire la lumière et la distorsion
        
        // On rétablit les transitions CSS fluides (Bezier)
        trigger.style.transition = '';
        panel.style.transition = '';
        trigger.style.transform = ''; // Supprime le style inline
        panel.style.transform = '';

        // Décision : Ouvrir ou Fermer ?
        const delta = startX - clientX; // Distance parcourue
        const screenW = window.innerWidth;

        if (delta > screenW * dragThreshold) {
            openChat();
        } else {
            closeChat();
        }
    };


    // --- 4. ÉCOUTEURS D'ÉVÉNEMENTS (LISTENERS) ---

    // Tactile (Mobile)
    trigger.addEventListener('touchstart', (e) => {
        // e.touches[0] contient les coordonnées du premier doigt
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: true});

    window.addEventListener('touchmove', (e) => {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: true});

    window.addEventListener('touchend', (e) => {
        endDrag(e.changedTouches[0].clientX);
    });

    // Souris (Desktop)
    trigger.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Empêche la sélection de texte
        startDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
        moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
        endDrag(e.clientX);
    });


    // --- 5. FONCTIONS D'ÉTAT (OUVERTURE/FERMETURE) ---

    function openChat() {
        body.classList.add('chat-open');
        trigger.classList.remove('pulse', 'flag-visible');
    }

    function closeChat() {
        body.classList.remove('chat-open');
        // On relance le "pulse" après une petite pause
        setTimeout(() => trigger.classList.add('pulse'), 500);
    }

    // Clic simple (Tap) sans glisser
    trigger.addEventListener('click', () => {
        if (!isDragging) openChat();
    });

    // Bouton de fermeture
    closeBtn.addEventListener('click', closeChat);
});
