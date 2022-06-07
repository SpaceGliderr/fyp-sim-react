export class GeneralUtils {
  public static generateExpiryDate = (duration: number) => {
    // Offset is to account fo the potential delay in the spawner
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + duration);
    return expiryDate;
  };

  public static differenceBetweenDates = (date1: Date, date2: Date) => {
    return Math.abs(date1.getTime() - date2.getTime());
  };
}
