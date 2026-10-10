"use client";

interface AdminHeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

// Bilah atas hanya untuk layar di bawah lg. Di layar lebar sidebar selalu tampil, jadi bilah ini disembunyikan.
export default function AdminHeader({ menuOpen, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="adm-topbar lg:hidden">
      <button
        type="button"
        onClick={onMenuToggle}
        data-menu-toggle
        aria-expanded={menuOpen}
        className="adm-btn adm-btn--sm adm-btn--outline"
      >
        Menu
      </button>
      <span className="adm-topbar__name">D&apos;Production</span>
    </header>
  );
}
