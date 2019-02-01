import { Injectable } from '@angular/core';
import { IProduct } from 'src/app/shared/interfaces/product';
import { Observable, BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private wishList: IProduct[] = [];
  private wishListIds: String[] = [];
  private products: IProduct[] = [];

  private wishListSource = new BehaviorSubject<IProduct[]>([]);

  constructor(
    private dataService: DataService,
  ) {
    const wishListIds = JSON.parse(localStorage.getItem('wishlist'));
    this.wishListIds = wishListIds ? wishListIds : this.wishListIds;
  }

  public getWishList(): Observable<IProduct[]> {
    return this.wishListSource.asObservable();
  }

  public getProducts(): Observable<IProduct[]> {
    return Observable.create((observer) => {

      this.dataService.get('assets/mock/products.json').subscribe(data => {

        this.prepareProductResponse(data);

        this.wishListSource.next(this.wishList);
        observer.next(this.products);
      });

    });
  }

  public addToWishList(product): void {

    product.addedToWishList = true;
    this.wishList.push(product);
    this.wishListIds.push(product.id);

    this.updateWishList();
  }

  public removeFromWishList(product): void {
    product.addedToWishList = false;

    const indexOfCurrId = this.wishListIds.findIndex(el => el === product.id);
    this.wishListIds.splice(indexOfCurrId, 1);
    const indexOfCurrProduct = this.wishList.findIndex(el => el.id === product.id);
    this.wishList.splice(indexOfCurrProduct, 1);

    this.updateWishList();
  }

  public toggleWishListProduct(product) {
    if (!product.addedToWishList) {
      this.addToWishList(product);
      return;
    }
    this.removeFromWishList(product);
  }

  private checkProductInWishList(product: IProduct): IProduct {
    product.addedToWishList = this.wishListIds.includes(product.id);
    return product;
  }

  private prepareProductResponse(products: IProduct[]): void {
    this.products = products.map(el => {
      const currentProduct = this.checkProductInWishList(el);

      if (currentProduct.addedToWishList) {
        this.wishList.push(currentProduct);
      }

      return currentProduct;
    });
  }

  private updateWishList(): void {
    localStorage.setItem('wishlist', JSON.stringify(this.wishListIds));
    this.wishListSource.next(this.wishList);
  }
}
