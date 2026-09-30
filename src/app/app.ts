import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StateService } from './core/services/state.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { World3DComponent } from './features/world-3d/world-3d.component';
import { World2DComponent } from './features/world-3d/world-2d.component';
import { IslandDetailComponent } from './features/island-detail/island-detail.component';
import { IdeComponent } from './features/ide/ide.component';
import { LabsHubComponent } from './features/labs/labs-hub.component';
import { CareerPathsComponent } from './features/career/career-paths.component';
import { ProjectsCatalogComponent } from './features/projects/projects-catalog.component';
import { TeacherPortalComponent } from './features/teacher/teacher-portal.component';
import { AdminPortalComponent } from './features/admin/admin-portal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    NavbarComponent,
    OnboardingComponent,
    World3DComponent,
    World2DComponent,
    IslandDetailComponent,
    IdeComponent,
    LabsHubComponent,
    CareerPathsComponent,
    ProjectsCatalogComponent,
    TeacherPortalComponent,
    AdminPortalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private state = inject(StateService);

  readonly hasCompletedOnboarding = this.state.hasCompletedOnboarding;
  readonly activeView = this.state.activeView;

  readonly effectiveView = computed(() => {
    if (!this.hasCompletedOnboarding() || this.activeView() === 'onboarding') {
      return 'onboarding';
    }
    return this.activeView();
  });
}
