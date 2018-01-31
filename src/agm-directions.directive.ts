import { Directive, Input, OnChanges, OnInit, EventEmitter } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';

declare var google: any;
@Directive({
  selector: 'agm-direction'
})
export class AgmDirection implements OnChanges, OnInit {

  @Input() origin: { lat: Number, lng: Number };
  @Input() destination: { lat: Number, lng: Number };
  @Input() waypoints: any = [];
  @Input() travelMode: string = 'DRIVING';
  @Input() optimizeWaypoints: boolean = true;
  @Input() visible: boolean = true;
  @Input() customIcon: {
    origin: string,
    destination: string,
    waypoint: string
  } = null;
  public directionsService = new google.maps.DirectionsService;
  public directionsDisplay: any = undefined;
  markers = new Array();
  constructor(
    private gmapsApi: GoogleMapsAPIWrapper
  ) { }

  ngOnInit() {
    this.directionDraw();
  }

  ngOnChanges() {
    if (this.directionsDisplay && !this.visible) {
      this.directionsDisplay.setMap(null);
      this.directionsDisplay = undefined;
      while (this.markers.length) {
        this.markers.pop().setMap(null);
      }
    } else {
      this.directionDraw();
    }
  }

  private treatCustomIcons(map) {
    if (typeof this.directionsDisplay === 'undefined') {
      return;
    }
    if (this.customIcon) {
      this.directionsDisplay.setOptions({
        suppressMarkers : true //remove default markers
      });
      let locations = [this.origin, this.destination].concat(this.waypoints.map(o => o.location));
      locations.forEach((o, i) => {
        let marker = new google.maps.Marker({
          position: o,
          map: map,
          icon: {
            url:  (i === 0 ? this.customIcon.origin : (i === 1 ? this.customIcon.destination : this.customIcon.waypoint)) || null,
            scaledSize: new google.maps.Size(32, 32)
          }
        });
        this.markers.push(marker);
      });
    }
  }

  /**
   * This event is fired when the user creating or updating this direction
   */
  private directionDraw() {
    if (!this.visible) {
      return;
    }
    this.gmapsApi.getNativeMap().then(map => {

      if (typeof this.directionsDisplay === 'undefined') {
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(map);
        this.treatCustomIcons(map);
      } else {
        this.directionsDisplay.setMap(null);
      }


      this.directionsService.route({
        origin: this.origin,
        destination: this.destination,
        waypoints: this.waypoints,
        optimizeWaypoints: this.optimizeWaypoints,
        travelMode: this.travelMode
      }, (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsDisplay.setDirections(response);
        }
      });

    });

  }

}
