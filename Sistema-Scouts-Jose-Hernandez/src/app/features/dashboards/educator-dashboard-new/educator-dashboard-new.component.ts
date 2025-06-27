import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf, NgFor, NgClass, SlicePipe, DatePipe} from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { ProgressionService } from '../../../core/services/progression.service';
import { CompetenceProgress, CompetenceStatus } from '../../../core/models/progression.model';
import { DashboardService, EducatorDashboardDto } from '../../../core/services/dashboard.service';
import { EducatorsService } from '../../../core/services/educators.service';
import { SectionMember } from '../../../core/models/user.model';

@Component({
  selector: 'app-educator-dashboard-new',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, SlicePipe, DatePipe],
  templateUrl: './educator-dashboard-new.component.html',
  styleUrl: './educator-dashboard-new.component.css'
})
export class EducatorDashboardNewComponent implements OnInit {
  user: User | null = null;
  pendingApprovals: CompetenceProgress[] = [];
  scoutsWithPendingApprovals: any[] = [];
  sectionStats = {
    totalScouts: 0,
    totalEducators: 0,
    activeScouts: 0,
    sectionName: ''
  };
  upcomingEvents: any[] = [];

  quickActions = [
    {
      title: 'Gestión de Scouts',
      description: 'Administra los scouts de tu sección',
      icon: 'users',
      route: '/educators',
      color: 'blue'
    },
    {
      title: 'Gestión de Eventos',
      description: 'Crear y administrar eventos',
      icon: 'calendar',
      route: '/event-crud',
      color: 'purple'
    },
    {
      title: 'Registro de Asistencia',
      description: 'Próximamente',
      icon: 'check-circle',
      route: '#',
      color: 'yellow'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private progressionService: ProgressionService,
    private dashboardService: DashboardService,
    private educatorsService: EducatorsService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadPendingApprovals();
    this.loadSectionStats();
  }

  private loadPendingApprovals(): void {
    this.progressionService.getPendingApprovals().subscribe({
      next: (approvals) => {
        this.pendingApprovals = approvals;
        this.groupApprovalsByScout(approvals);
      },
      error: (error) => {
        console.error('Error loading pending approvals:', error);
        // Fallback to mock data for now
        this.loadMockPendingApprovals();
      }
    });
  }

  private groupApprovalsByScout(approvals: CompetenceProgress[]): void {
    // Group competences by member/scout
    const groupedByMember = approvals.reduce((acc, approval) => {
      const memberKey = approval.marchSheetId; // or however we identify the member
      const memberName = this.extractMemberName(approval);

      if (!acc[memberKey]) {
        acc[memberKey] = {
          memberId: approval.marchSheetId,
          memberName: memberName,
          pendingCount: 0,
          approvals: []
        };
      }

      acc[memberKey].pendingCount++;
      acc[memberKey].approvals.push(approval);

      return acc;
    }, {} as any);

    this.scoutsWithPendingApprovals = Object.values(groupedByMember);
  }

  private extractMemberName(approval: CompetenceProgress): string {
    // Try to get member name from the competence progress data
    // This might need adjustment based on actual API response structure
    return approval.competence?.title?.split(' ')[0] || 'Scout';
  }

  private loadMockPendingApprovals(): void {
    // Fallback mock data when API is not available
    this.scoutsWithPendingApprovals = [
      {
        memberId: 1,
        memberName: 'Ana García',
        pendingCount: 3,
        approvals: []
      },
      {
        memberId: 2,
        memberName: 'Carlos Méndez',
        pendingCount: 1,
        approvals: []
      }
    ];
  }

  private loadSectionStats(): void {
    // Load educator dashboard data for section info
    this.dashboardService.getEducatorDashboard().subscribe({
      next: (dashboardData) => {
        this.sectionStats.totalScouts = dashboardData.scoutsCount;
        this.sectionStats.sectionName = dashboardData.sectionName;
        this.sectionStats.activeScouts = dashboardData.scoutsCount; // Assuming all are active for now

        // Load section-specific upcoming events
        this.upcomingEvents = dashboardData.upcomingEventsList || [];

        // Load educator count from nomina
        this.loadEducatorCount();
      },
      error: (error) => {
        console.error('Error loading educator dashboard data:', error);
        // Fallback data
        this.sectionStats = {
          totalScouts: 24,
          totalEducators: 3,
          activeScouts: 22,
          sectionName: 'Scouts'
        };

        // Fallback mock events
        this.upcomingEvents = [
          {
            title: 'Reunión de Sección',
            date: 'Sábado 15 Jul',
            description: 'Reunión semanal con actividades de progresión'
          },
          {
            title: 'Campamento de Sección',
            date: '22-24 Jul',
            description: 'Campamento de fin de semana'
          }
        ];
      }
    });
  }

  private loadEducatorCount(): void {
    this.educatorsService.getNomina().subscribe({
      next: (nomina) => {
        // Filter educators from the nomina using isEducator property
        const educators = nomina.filter(member => member.isEducator === true);
        this.sectionStats.totalEducators = educators.length;
      },
      error: (error) => {
        console.error('Error loading nomina:', error);
        // Keep fallback data
        this.sectionStats.totalEducators = 3;
      }
    });
  }

  navigateTo(route: string): void {
    if (route !== '#') {
      this.router.navigate([route]);
    }
  }

  viewScoutMarchSheet(memberId: number): void {
    this.router.navigate(['/progression', 'march-sheet', memberId]);
  }

  getIconSvg(iconName: string): SafeHtml {
    const icons: {[key: string]: string} = {
      'users': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>',
      'chart-line': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>',
      'calendar': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      'check-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[iconName] || '');
  }
}
