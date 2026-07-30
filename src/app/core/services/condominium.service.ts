import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Condominium } from '../models/condominium.model';

/** GET /condominiums — rota publica, usada no dropdown da tela de Cadastro. */
@Injectable({ providedIn: 'root' })
export class CondominiumService {
  private readonly baseUrl = `${environment.apiUrl}/condominiums`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Condominium[]> {
    return this.http.get<Condominium[]>(this.baseUrl);
  }
}
