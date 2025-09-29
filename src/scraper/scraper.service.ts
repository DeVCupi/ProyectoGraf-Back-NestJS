import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class ScraperService {
  private browser: Browser;

  // abre navegador una sola vez para que sea más rápido
  private async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async scrape(url: string) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.waitForSelector("ul.primary-menu")
    // extraemos directamente en el navegador
    const menu = await page.evaluate(() => {
      const items: any[] = [];
      const menuLis = document.querySelectorAll('ul.primary-menu > li');
      menuLis.forEach((li) => {
        const catA = li.querySelector(':scope > a');
        const category = catA?.textContent?.trim() ?? '';
        const categoryLink = catA?.getAttribute('href') ?? '';  

        const subcategories: any[] = [];
        const products: any[] = [];
        const subLis = li.querySelectorAll(':scope > ul.sub-menu > li');
        subLis.forEach((subLi) => {
          const subA = subLi.querySelector(':scope > a');
          const subName = subA?.textContent?.trim() ?? '';
          const subLink = subA?.getAttribute('href') ?? '';
          
          const productsList = subLi.querySelectorAll(':scope > ul.sub-menu > li');

          if(productsList.length > 0){
            subcategories.push({
              name: subName,
              link: subLink
            });

            productsList.forEach(async (cLi) => {
              const cA = cLi.querySelector(':scope > a');

              products.push({
                name: cA?.textContent?.trim() ?? '',
                link: cA?.getAttribute('href') ?? '',
                subcategory: subName 
              });
            });
            
          }else{
            products.push({
              name: subName,
              link: subLink
            });
          }
            
        });

        items.push({
          category,
          link: categoryLink,
          subcategories,
          products
        });

      });

      return items;
    });

    let globalIndex = 0;

    for (const e of menu) {
      if (e.products && e.products.length > 0) {
        console.log(`Procesando categoría: ${e.category} con ${e.products.length} productos`);
        for (const p of e.products) {
          p.color = globalIndex % 2 === 0
            ? "rgba(198, 199, 229, 0.5)"
            : "rgba(250, 219, 208, 0.5)";
          globalIndex++;
        }
        for (const p of e.products) {

          if(p.name == "Vinilo Microperforado"){
            p.link = p.link + "vinilo-microperforado/"
          }

          // console.log(p.link)
          
          await page.goto(p.link, { 
            waitUntil: 'networkidle0', 
            timeout: 50000 
          });
          
          try {
            await page.waitForSelector('.woocommerce-product-gallery__image', { timeout: 10000 });
          } catch (selectorError) {
            console.warn(`Selector .woocommerce-product-gallery__image no encontrado para ${p.name} - ${p.link}`);
          }

          try {
            await page.waitForSelector('.sticky', { timeout: 10000 });
          } catch (selectorError) {
            console.warn(`Selector .sticky no encontrado para ${p.name} - ${p.link}`);
          }

          const dataProduct = await page.evaluate(() => {
            const sticky = document.querySelector('.sticky');
            
            // VALIDACIÓN CRÍTICA: Verificar que sticky existe
            if (!sticky) {
              console.log('Elemento .sticky no encontrado');
              return { 
                details: '', 
                price: '',
                discount_percentage: null,
                image: '',
                sold_out: true
              };
            }

            const img = document.querySelector('div.woocommerce-product-gallery__image > a');
            
            const detailsDiv = sticky.querySelector('div.woocommerce-product-details__short-description');
                        
            // const detailText = Array.from(detailsDiv.querySelectorAll('p')).map(p => p.textContent?.trim() || '');
            // const detailsList = Array.from(detailsDiv.querySelectorAll('ul > li')).map(li => li.textContent?.trim() || '');
          
            // // Concatenar con validaciones corregidas
            // let details = '';
            // if (detailText.length > 0) {
            //   detailText.forEach(t => details += t + ' ');
            // }
            // if (detailsList.length > 0) { // CORREGIDO: era detailText.length
            //   detailsList.forEach(li => details += li + ' ');
            // }
          
            // Extraer precio con validaciones
            let priceAllContainers = sticky.querySelectorAll('.price > span.amount > bdi');
            let priceToSave: string = ""
            if (priceAllContainers.length == 0) {
              const priceContainer = sticky.querySelector('.price > ins > span.amount > bdi');
              if(priceContainer){
                priceToSave = '$' + priceContainer.textContent.trim().replace('$', '')
              }
            }else if(priceAllContainers.length > 0){
              priceAllContainers.forEach((p, index)=>{
                priceToSave = priceToSave + ('$' + p.textContent.trim().replace('$', ''))
                if(index + 1 < priceAllContainers.length){
                  priceToSave += " - "
                }
              })
            }

            const oldPrice = sticky.querySelector('.price > span.screen-reader-text')
            let discountPercentage = 0;

            if (oldPrice && !oldPrice.textContent.includes("Rango de precios") && priceToSave !== "") {
              const clean = (txt: string) =>
                parseFloat(
                  txt
                    .replace(/[^\d,\.]/g, '') // deja solo dígitos, puntos y comas
                    .replace(/\./g, '')       // quita puntos de miles
                    .replace(',', '.')        // convierte coma decimal en punto
                );
              const oldPriceValue = clean(oldPrice.textContent.trim());
              const newPriceValue = clean(priceToSave.split("-")[0].trim());
              discountPercentage = ((oldPriceValue - newPriceValue) / newPriceValue) * 100;
            }

            let sold_out = true 
            if(priceToSave !== ""){
              const price = parseFloat(
                priceToSave.split("-")[0].trim().replace('$', '')
              );
              sold_out = price <= 0;
            }
            
            return { 
              details: detailsDiv ? detailsDiv.innerHTML.trim() : '', 
              price: priceToSave,
              discount_percentage: discountPercentage > 0 ? `${discountPercentage.toFixed(4)}%` : null,
              image: img?.getAttribute('href') ?? '',
              sold_out
            };
          });
    
          p.details = dataProduct.details;
          p.price = dataProduct.price;
          p.discount_percentage = dataProduct.discount_percentage
          p.image = dataProduct.image
          p.sold_out = dataProduct.sold_out
          await page.goBack();
        }
      }
    }
    await page.close();
    return menu;
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}