import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ZoneService } from '../../services/zone.service';
import { Zone } from '../../models/zone.model';
import { ZoneDialogComponent } from './zone-dialog.component';
import { ZoneProjetsComponent } from './zone-projets.component';
import { ProjetDialogComponent } from '../projets/projet-dialog.component';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
        </mat-card-header>
        <div class="button-container">
          <button mat-raised-button color="primary" (click)="openZoneDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle Zone
          </button>
        </div>
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let zone" class="clickable" (click)="openZoneProjets(zone)">{{zone.nom}}</td>
            </ng-container>

            <ng-container matColumnDef="localisation">
              <th mat-header-cell *matHeaderCellDef>Localisation</th>
              <td mat-cell *matCellDef="let zone">{{zone.localisation}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let zone">{{zone.description || 'Non spécifiée'}}</td>
            </ng-container>

            <ng-container matColumnDef="projets">
              <th mat-header-cell *matHeaderCellDef>Projets</th>
              <td mat-cell *matCellDef="let zone">{{zone.projets?.length || 0}} projets</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let zone">
                <div class="action-buttons">
                  <button mat-icon-button color="primary" (click)="editZone(zone); $event.stopPropagation()" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteZone(zone); $event.stopPropagation()" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [pageSize]="5" [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of zones"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .button-container {
      padding: 0 20px 20px 20px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    table {
      width: 100%;
    }
    .clickable {
      cursor: pointer;
      color: #2196F3;
    }
    .clickable:hover {
      text-decoration: underline;
    }
    mat-card-content {
      padding: 20px;
    }
    .mat-column-actions {
      width: 120px;
      text-align: center;
      padding: 0;
    }
    .action-buttons {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
    }
    .action-buttons button {
      width: 36px;
      height: 36px;
      line-height: 36px;
      padding: 0;
    }
    .action-buttons mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
    td.mat-cell {
      text-align: center;
      padding: 0 8px;
    }
    th.mat-header-cell {
      text-align: center;
      padding: 0 8px;
    }
    .mat-column-actions .mat-cell {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
  `]
})
export class ZonesComponent implements OnInit {
  dataSource = new MatTableDataSource<Zone>([]);
  displayedColumns: string[] = ['nom', 'localisation', 'description', 'projets', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private zoneService: ZoneService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadZones();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadZones() {
    this.zoneService.getAllZones().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des zones:', error);
      }
    });
  }

  openZoneDialog(zone?: Zone) {
    const dialogRef = this.dialog.open(ZoneDialogComponent, {
      width: '500px',
      data: zone || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.zoneService.updateZone(result.id, result).subscribe({
            next: () => {
              this.loadZones();
            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour de la zone:', error);
            }
          });
        } else {
          this.zoneService.createZone(result).subscribe({
            next: () => {
              this.loadZones();
            },
            error: (error) => {
              console.error('Erreur lors de la création de la zone:', error);
            }
          });
        }
      }
    });
  }

  openZoneProjets(zone: Zone) {
    const dialogRef = this.dialog.open(ZoneProjetsComponent, {
      width: '800px',
      data: { zone: zone }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'create') {
          this.openProjetDialog(result.zone);
        } else if (result.action === 'details') {
          this.router.navigate(['/projets', result.projet.id]);
        }
      }
    });
  }

  openProjetDialog(zone: Zone) {
    const dialogRef = this.dialog.open(ProjetDialogComponent, {
      width: '500px',
      data: { zone: zone }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadZones();
      }
    });
  }

  editZone(zone: Zone) {
    this.openZoneDialog(zone);
  }

  deleteZone(zone: Zone) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) {
      this.zoneService.deleteZone(zone.id!).subscribe({
        next: () => {
          this.loadZones();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la zone:', error);
        }
      });
    }
  }
} 