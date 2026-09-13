"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        onClose();
      }, 2000);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-0 overflow-hidden"
      style={{ background: "rgba(8, 10, 14, 0.9)" }}
    >
      <div className="text-white text-left bg-dark rounded-[10px] w-full max-w-[37.25rem] mx-auto p-0 relative overflow-hidden max-md:max-w-[30rem] max-xs:max-w-full max-xs:mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="z-[5] opacity-70 cursor-pointer bg-center bg-no-repeat absolute top-[1.8rem] right-[1.8rem] w-6 h-6 transition-opacity duration-200 hover:opacity-100 bg-transparent border-0 max-md:top-6 max-md:right-6 max-xs:top-4 max-xs:right-4"
          style={{
            backgroundImage: "url(/Assets/ico-close-modal.svg)",
            backgroundSize: "1.5rem",
          }}
          aria-label="Close modal"
        />

        {/* Modal Image */}
        <Image
          src="/Assets/modal-form.png"
          alt="Newsletter preview"
          width={596}
          height={300}
          className="w-full block relative object-contain object-bottom"
          sizes="(max-width: 1192px) 100vw, 596px"
        />

        {/* Content */}
        <div className="z-[2] rounded-[1.5rem] flex flex-col justify-start items-stretch w-full h-full px-12 pb-12 pt-6 relative overflow-hidden max-md:px-6 max-md:pb-6">
          <div className="flex justify-between w-full mb-4 max-xs:block">
            <div className="max-w-[11.25rem] font-grotesque text-[1.5rem] font-bold leading-[1.1] max-xs:max-w-full max-xs:mb-4">
              Subscribe to our newsleter
            </div>
            <p className="max-w-[14rem] mb-0 text-base leading-[1.5] max-xs:max-w-[22rem]">
              Get weekly updates on the newest cloneable websites right in your
              mailbox.
            </p>
          </div>

          {submitted ? (
            <div
              className="text-left py-4 px-6 font-bold rounded-lg mt-4"
              style={{
                backgroundImage:
                  "linear-gradient(146deg, #52f3b0, #3b4afb)",
              }}
            >
              Your submission
              <br />
              has been received!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-[72px] w-full text-white bg-transparent border-0 border-b border-b-white/20 rounded-none mb-0 px-0 transition-all duration-200 focus:border-b-white/20 focus:outline-none text-base"
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  className="form-submit-wrap bg-white rounded-full flex justify-center items-center w-10 h-10 absolute bottom-[1.1rem] right-0 overflow-hidden cursor-pointer border-0"
                >
                  <div className="overflow-hidden relative">
                    <div className="overflow-anim relative transition-all duration-200" style={{ right: 0 }}>
                      <Image
                        src="/Assets/ico-submit-arrow.svg"
                        alt="Submit"
                        width={16}
                        height={16}
                        className="block invert-[90%]"
                      />
                    </div>
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
