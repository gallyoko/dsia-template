import ResizeObserver from 'resize-observer-polyfill';

export class ResizeContainer {
  private readonly observer: ResizeObserver;
  private readonly elementLeft: HTMLElement;
  private readonly elementFullInitialWidth: number;

  private isStarted = false;

  constructor(
    elementLeftId: string,
    elementRightId: string,
    marginLeftSup = 0
  ) {
    this.elementLeft = document.getElementById(elementLeftId);
    const elementRight = document.getElementById(elementRightId);

    this.elementFullInitialWidth = this.elementLeft.clientWidth;

    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const newWidth = this.elementFullInitialWidth - entry.contentRect.width - 8;
        elementRight.style.marginLeft = `${this.elementFullInitialWidth - newWidth + marginLeftSup}px`;
      });
    });
  }

  public startListener(): void {
    if (!this.isStarted) {
      this.isStarted = true;
      this.observer.observe(this.elementLeft);
    }
  }

  public stopListener(): void {
    this.observer.unobserve(this.elementLeft);
    this.isStarted = false;
  }
}
