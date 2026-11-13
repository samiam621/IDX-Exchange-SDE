// @vitest-environment jsdom
// Week 8: carousel, gallery/lightbox, map, open houses
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PropertyImageCarousel from '../../src/components/PropertyImageCarousel';
import PropertyImageGallery from '../../src/components/PropertyImageGallery';
import PropertyMap from '../../src/components/PropertyMap';
import OpenHouses from '../../src/components/OpenHouses';
import { formatTime } from '../../src/utils';

afterEach(cleanup);

const PHOTOS = '["https://example.com/a.jpg","https://example.com/b.jpg","https://example.com/c.jpg"]';

describe('PropertyImageCarousel', () => {
  it('arrows cycle photos, update the counter, and do not click the card', () => {
    const cardClick = vi.fn();
    render(<div onClick={cardClick}><PropertyImageCarousel photos={PHOTOS} alt="home" /></div>);
    screen.getByText('1 / 3');
    fireEvent.click(screen.getByLabelText('Next photo'));
    screen.getByText('2 / 3');
    fireEvent.click(screen.getByLabelText('Previous photo'));
    fireEvent.click(screen.getByLabelText('Previous photo')); // wraps to the last photo
    screen.getByText('3 / 3');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('shows no arrows for a single photo', () => {
    render(<PropertyImageCarousel photos='["https://example.com/a.jpg"]' alt="home" />);
    expect(screen.queryByLabelText('Next photo')).toBeNull();
  });
});

describe('PropertyImageGallery', () => {
  it('thumbnail click changes the main image', () => {
    render(<PropertyImageGallery photos={PHOTOS} alt="home" />);
    fireEvent.click(screen.getByLabelText('Photo 2'));
    expect(screen.getByAltText('home').getAttribute('src')).toBe('https://example.com/b.jpg');
  });

  it('lightbox opens, takes focus, arrows navigate, Escape closes', () => {
    render(<PropertyImageGallery photos={PHOTOS} alt="home" />);
    fireEvent.click(screen.getByLabelText('Open photo full screen'));
    const lightbox = screen.getByRole('dialog');
    expect(document.activeElement).toBe(lightbox); // focused, so real key presses reach it
    fireEvent.keyDown(lightbox, { key: 'ArrowRight' });
    screen.getByText('2 / 3');
    fireEvent.keyDown(lightbox, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lightbox closes on background click but not on image click', () => {
    render(<PropertyImageGallery photos={PHOTOS} alt="home" />);
    fireEvent.click(screen.getByLabelText('Open photo full screen'));
    fireEvent.click(screen.getByRole('dialog').querySelector('img'));
    screen.getByRole('dialog');
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('bad L_Photos shows a placeholder', () => {
    render(<PropertyImageGallery photos='["broken' alt="home" />);
    screen.getByText('No photos');
  });
});

describe('PropertyMap', () => {
  it('renders the iframe and a directions link for the coordinates', () => {
    render(<PropertyMap lat="33.465212" lng="-117.698435" />);
    expect(screen.getByTitle('Property location').src).toContain('q=33.465212,-117.698435&zoom=15');
    const link = screen.getByText('Get Directions');
    expect(link.target).toBe('_blank');
    expect(link.href).toContain('destination=33.465212,-117.698435');
  });

  it('renders nothing if lat or lng is missing', () => {
    const { container } = render(<PropertyMap lat="33.4" lng={null} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('OpenHouses', () => {
  it('formats times', () => {
    expect(formatTime('13:30:00')).toBe('1:30 PM');
    expect(formatTime('00:05:00')).toBe('12:05 AM');
    expect(formatTime('12:00:00')).toBe('12:00 PM');
  });

  it('shows date, times, and remarks pulled out of all_data', () => {
    render(<OpenHouses openHouses={[
      { id: 1, OpenHouseDate: '2026-09-27T19:00:00.000Z', OH_StartTime: '13:30:00', OH_EndTime: '15:30:00', all_data: '{"OpenHouseRemarks":"Bring snacks"}' },
      { id: 2, OpenHouseDate: '2026-09-28T19:00:00.000Z', OH_StartTime: '11:00:00', OH_EndTime: '14:00:00', all_data: 'not json' },
    ]} />);
    screen.getByText(/September 27, 2026/);
    screen.getByText('1:30 PM - 3:30 PM');
    screen.getByText('Bring snacks');
    screen.getByText('11:00 AM - 2:00 PM');
  });

  it('shows a message when there are none', () => {
    render(<OpenHouses openHouses={[]} />);
    screen.getByText('No open houses scheduled');
  });
});
