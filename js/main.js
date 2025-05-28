/**
 * Main JavaScript file for Saksham's Personal Website
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const iconElement = themeToggle.querySelector('i');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Check if user previously set a theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme === 'light', iconElement);
    }
    
    // Toggle theme when clicked
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? '' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateIcon(newTheme === 'light', iconElement);
    });
    
    // Function to update icon based on theme
    function updateIcon(isLight, icon) {
        if (isLight) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    // Mobile menu toggle functionality
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            const icon = mobileMenuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});