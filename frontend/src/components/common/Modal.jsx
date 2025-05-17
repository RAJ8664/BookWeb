import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  showCloseButton = true,
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastActiveElement = useRef(null);

  // Handle focus trap and management
  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before opening the modal
      lastActiveElement.current = document.activeElement;
      
      // Focus the modal or close button when opened
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent scrolling of the background content
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = '';
      
      // Return focus to the element that was focused before the modal was opened
      if (lastActiveElement.current) {
        lastActiveElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle focus trap within the modal
  const handleTabKey = (event) => {
    if (!modalRef.current || !isOpen) return;

    // Get all focusable elements
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab is pressed and focus is on the first element, move to the last element
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    } 
    // If tab is pressed and focus is on the last element, move to the first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      handleTabKey(event);
    }
  };

  // Handle click outside modal to close it
  const handleBackdropClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase() || 'modal'}`}
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative ${className}`}
            ref={modalRef}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            {showCloseButton && (
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
                tabIndex={0}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
            
            {title && (
              <h2 
                id={`modal-title-${title.replace(/\s+/g, '-').toLowerCase() || 'modal'}`}
                className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200"
              >
                {title}
              </h2>
            )}
            
            <div className="modal-content">
              {children}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool
};

export default Modal; 