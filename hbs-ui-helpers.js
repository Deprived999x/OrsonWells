/**
 * HBS UI Helper functions
 * Provides utilities for managing the UI elements
 */

const HBSUIHelpers = {
    /**
     * Shows a specific menu section and hides others
     * @param {string} sectionId - The ID of the section to show
     */
    showMenuSection(sectionId) {
        const sections = document.querySelectorAll('.menu-section');
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    },
    
    /**
     * Toggles visibility of a menu section
     * @param {string} sectionId - The ID of the section to toggle
     */
    toggleMenuSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const content = section.querySelector('.menu-content');
            if (content) {
                content.classList.toggle('hidden');
                const heading = section.querySelector('h3, h4');
                if (heading) {
                    heading.classList.toggle('expanded');
                }
            }
        }
    },
    
    /**
     * Initializes all menu sections to ensure they're visible
     */
    initMenuSections() {
        const sections = document.querySelectorAll('.menu-section');
        sections.forEach(section => {
            section.classList.remove('hidden');
            
            // Make sure the content is visible initially
            const content = section.querySelector('.menu-content');
            if (content) {
                content.classList.remove('hidden');
            }
            
            // Set expanded state on headings
            const heading = section.querySelector('h3, h4');
            if (heading) {
                heading.classList.add('expanded');
            }
        });
    },
    
    /**
     * Refreshes the UI to ensure all elements are properly displayed
     */
    refreshUI() {
        // Ensure all menu sections are visible
        this.initMenuSections();
        
        // Refresh form controls
        const formControls = document.querySelectorAll('select, input');
        formControls.forEach(control => {
            // Force a refresh by briefly changing and restoring tabindex
            const currentTabIndex = control.tabIndex;
            control.tabIndex = -1;
            setTimeout(() => {
                control.tabIndex = currentTabIndex;
            }, 10);
        });
    }
};

// Make helpers available globally
window.HBSUIHelpers = HBSUIHelpers;

// Initialize UI when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    HBSUIHelpers.initMenuSections();
    console.log("HBS UI Helpers initialized");
});
